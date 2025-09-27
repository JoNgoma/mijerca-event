<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useServiceContext } from '@/composables/useServiceContext';

const route = useRoute();
const { currentService } = useServiceContext();

const sectorService = computed(() => route.params.serviceType || currentService.value.position);
const sector = computed(() => {
  if (sectorService.value === "est") return "KIN EST";
  if (sectorService.value === "centre") return "KIN CENTRE";
  if (sectorService.value === "ouest") return "KIN OUEST";
  return "KIN EST";
});

// ==========================
// Données et config
// ==========================
const API_URL = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem("token");

const sectorRef = ref(null);
const doyennes = ref([]);
const totalSecteur = ref(0);
const topParoisses = ref([]);

const widgetData = ref({
  est: { frere: 0, soeur: 0 },
  centre: { frere: 0, soeur: 0 },
  ouest: { frere: 0, soeur: 0 },
  total: { frere: 0, soeur: 0, est: 0, centre: 0, ouest: 0, total: 0 }
});

let eventSource = null;

// ==========================
// Helpers de normalisation
// ==========================
function normalizeRef(ref) {
  if (!ref) return "";
  try {
    const u = new URL(ref, "http://example.invalid");
    return u.pathname.replace(/\/+$/, "");
  } catch (e) {
    const r = String(ref);
    const stripped = r.replace(/^https?:\/\/[^/]+/, "");
    return (stripped || "").replace(/\/+$/, "");
  }
}

// ==========================
// Calcul / mise à jour widget
// ==========================
function updateWidgetData(people) {
  // reset
  ["est","centre","ouest"].forEach(s => {
    widgetData.value[s].frere = 0;
    widgetData.value[s].soeur = 0;
  });

  people.forEach(p => {
    const secRef = normalizeRef(p.sector || p.sectorName || "");
    let key = null;
    if (secRef.includes("/sectors/1") || secRef.includes("KIN EST")) key = "est";
    else if (secRef.includes("/sectors/2") || secRef.includes("KIN CENTRE")) key = "centre";
    else if (secRef.includes("/sectors/3") || secRef.includes("KIN OUEST")) key = "ouest";

    if (!key) return;

    const gender = (p.gender || "").toLowerCase();
    if (["frère","frere","fr"].includes(gender)) widgetData.value[key].frere++;
    else if (["soeur","sœur","sr"].includes(gender)) widgetData.value[key].soeur++;
  });

  // totaux
  widgetData.value.total.frere = widgetData.value.est.frere + widgetData.value.centre.frere + widgetData.value.ouest.frere;
  widgetData.value.total.soeur = widgetData.value.est.soeur + widgetData.value.centre.soeur + widgetData.value.ouest.soeur;
  widgetData.value.total.est = widgetData.value.est.frere + widgetData.value.est.soeur;
  widgetData.value.total.centre = widgetData.value.centre.frere + widgetData.value.centre.soeur;
  widgetData.value.total.ouest = widgetData.value.ouest.frere + widgetData.value.ouest.soeur;
  widgetData.value.total.total = widgetData.value.total.est + widgetData.value.total.centre + widgetData.value.total.ouest;
}

// ==========================
// Récupération widget
// ==========================
async function fetchWidgetData() {
  try {
    const res = await fetch(`${API_URL}/people`, { headers: { Authorization: `Bearer ${token}` } });
    const people = (await res.json()).member || [];
    updateWidgetData(people);
  } catch (err) {
    console.error("❌ Erreur récupération widget", err);
  }
}

// ==========================
// SSE : écoute live
// ==========================
function initSSE() {
  try {
    eventSource = new EventSource(`${API_URL.replace("/api","")}/sse/people`);
  } catch (err) {
    console.warn("SSE non initialisé:", err);
    eventSource = null;
  }

  if (!eventSource) return;

  eventSource.onmessage = async (event) => {
    const p = JSON.parse(event.data || "{}");

    if (sectorRef.value && normalizeRef(p.sector) === sectorRef.value) {
      await fetchDoyennes();
    }

    // mise à jour rapide widget
    updateWidgetData([p]);
  };

  eventSource.onerror = (err) => {
    console.error("❌ SSE error", err);
    try { eventSource.close(); } catch(e){/*ignore*/}
  };
}

// ==========================
// Lifecycle
// ==========================
onMounted(async () => {
  await fetchSectorId();
  await fetchWidgetData();

  window.App?.init();
  window.App?.dashboard();

  initSSE();
});

onUnmounted(() => {
  if (eventSource) eventSource.close();
});

watch(() => route.params.serviceType, () => {
  fetchSectorId();
});

// ==========================
// Récupération doyennes / paroisses (inchangé)
// ==========================
async function fetchSectorId() {
  try {
    const res = await fetch(`${API_URL}/sectors?name=${encodeURIComponent(sector.value)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const sec = data.member?.find(s => s.name === sector.value);
    sectorRef.value = sec ? normalizeRef(sec['@id'] || sec.id) : null;

    await fetchDoyennes();
  } catch (err) {
    console.error("❌ Erreur récupération secteur", err);
    sectorRef.value = null;
  }
}

async function fetchParoissesBySector() {
  if (!sectorRef.value) return [];
  try {
    const res = await fetch(`${API_URL}/paroisses?sector=${encodeURIComponent(sectorRef.value)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return (await res.json()).member.map(p => ({
      id: normalizeRef(p['@id'] || p.id),
      name: p.name || p.fullName || "Paroisse inconnue",
      raw: p
    }));
  } catch (err) {
    console.error("❌ Erreur récupération paroisses", err);
    return [];
  }
}

async function fetchDoyennes() {
  if (!sectorRef.value) {
    doyennes.value = [];
    topParoisses.value = [];
    totalSecteur.value = 0;
    return;
  }

  try {
    const res = await fetch(`${API_URL}/people?sector=${encodeURIComponent(sectorRef.value)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const people = (await res.json()).member || [];

    const doyMap = {};
    const paroMap = {};

    people.forEach(p => {
      const doyKey = normalizeRef(p.doyenne) || "";
      const paroKey = normalizeRef(p.paroisse) || "";

      if (!doyMap[doyKey]) {
        doyMap[doyKey] = { id: doyKey, name: p.doyenneName || "Doyenné inconnu", paroisses: [], totalEffectif: 0 };
      }

      if (paroKey) {
        doyMap[doyKey].paroisses.push({ id: paroKey, name: p.paroisseName || null, effectif: 1 });
        doyMap[doyKey].totalEffectif += 1;

        if (!paroMap[paroKey]) paroMap[paroKey] = { id: paroKey, name: p.paroisseName || null, effectif: 0 };
        paroMap[paroKey].effectif += 1;
      }
    });

    totalSecteur.value = people.length;

    const paroissesSecteur = await fetchParoissesBySector();
    paroissesSecteur.forEach(par => {
      const key = par.id;
      if (!paroMap[key]) paroMap[key] = { id: key, name: par.name, effectif: 0 };
      else if (!paroMap[key].name) paroMap[key].name = par.name;
    });

    doyennes.value = Object.values(doyMap);
    topParoisses.value = Object.values(paroMap)
      .sort((a, b) => b.effectif - a.effectif)
      .slice(0, 5);

  } catch (err) {
    console.error("❌ Erreur récupération doyennés et personnes", err);
    doyennes.value = [];
    topParoisses.value = [];
    totalSecteur.value = 0;
  }
}
</script>

<template>
  <div class="be-content">
    <div class="main-content container-fluid">
      <!-- widgets (inchangés) -->
      <div class="row">
        <div class="col-12 col-lg-6 col-xl-3" v-for="(d, i) in [{k:'est',label:'KIN EST'},{k:'centre',label:'KIN CENTRE'},{k:'ouest',label:'KIN OUEST'},{k:'total',label:'KINSHASA'}]" :key="i">
          <div class="widget widget-tile">
            <div class="chart sparkline" :id="`spark${i+1}`"></div>
            <div class="data-info">
              <div class="desc">{{ d.label }}</div>
              <div class="value" v-if="d.k!=='total'">
                <span class="number indicator" data-toggle="counter" :data-end="widgetData[d.k].frere">{{widgetData[d.k].frere}}</span>
                <span class="indicator-equal mdi mdi-gender-male"></span>
              </div>
              <div class="value" v-if="d.k!=='total'">
                <span class="number indicator" data-toggle="counter" :data-end="widgetData[d.k].soeur">{{widgetData[d.k].soeur}}</span>
                <span class="indicator-negative mdi mdi-gender-female"></span>
              </div>

              <div class="value" v-if="d.k==='total'">
                <span class="number indicator" data-toggle="counter" :data-end="widgetData.total.frere">{{widgetData.total.frere}}</span>
                <span class="indicator-equal mdi mdi-gender-male"></span>
              </div>
              <div class="value" v-if="d.k==='total'">
                <span class="number indicator" data-toggle="counter" :data-end="widgetData.total.soeur">{{widgetData.total.soeur}}</span>
                <span class="indicator-negative mdi mdi-gender-female"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Participation paroisse -->
      <div class="row">
        <div class="col-12 col-lg-4">
          <div class="card">
            <div class="card-header card-header-divider pb-3">Participation paroisse</div>
            <div class="card-body pt-2">
              <div v-if="topParoisses.length === 0" class="text-muted">Aucune paroisse trouvée.</div>

              <div
                v-for="p in topParoisses"
                :key="p.id || p.name"
                class="mb-3"
              >
                <!-- Nom en haut -->
                <div class="fw-bold text-dark mb-1">
                  {{ p.name || 'Paroisse inconnue' }}
                </div>

                <!-- Progression et nombre -->
                <div class="d-flex align-items-center">
                  <div class="progress flex-grow-1" style="height: .4rem;">
                    <div
                      class="progress-bar bg-success"
                      role="progressbar"
                      :style="{ width: (totalSecteur > 0 ? (p.effectif / totalSecteur * 100).toFixed(0) : 0) + '%' }"
                    ></div>
                  </div>

                  <span class="small text-muted">
                    {{ p.effectif }} / {{ totalSecteur }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Le reste de ton layout (inchangé) -->
        <div class="col-12 col-lg-4">
          <div class="widget be-loading">
            <div class="widget-head">
              <div class="tools">
                <span class="icon mdi mdi-chevron-down"></span>
                <span class="icon mdi mdi-refresh-sync toggle-loading"></span>
                <span class="icon mdi mdi-close"></span>
              </div>
              <div class="title">Effectif général</div>
            </div>
            <div class="widget-chart-container">
              <div id="top-sales" style="height: 178px;"></div>
              <div class="chart-pie-counter">{{widgetData.total.total}}</div>
            </div>
            <div class="chart-legend">
              <table class="chart-legend">
                <tbody>
                  <tr>
                    <td class="chart-legend-color"><span data-color="top-sales-color1"></span></td>
                    <td>KIN EST</td>
                    <td class="chart-legend-value">{{widgetData.total.est}}</td>
                  </tr>
                  <tr>
                    <td class="chart-legend-color"><span data-color="top-sales-color2"></span></td>
                    <td>KIN CENTRE</td>
                    <td class="chart-legend-value">{{widgetData.total.centre}}</td>
                  </tr>
                  <tr>
                    <td class="chart-legend-color"><span data-color="top-sales-color3"></span></td>
                    <td>KIN OUEST</td>
                    <td class="chart-legend-value">{{widgetData.total.ouest}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="be-spinner">
              <svg width="40px" height="40px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                <circle class="circle" fill="none" stroke-width="4" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
              </svg>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4">
          <div class="widget widget-calendar">
            <div id="calendar-widget"></div>
          </div>
        </div>

      </div>
          <div class="row">
            <div class="col-md-12">
              <div class="widget widget-fullwidth be-loading">
                <div class="widget-head">
                  <div class="tools">
                    <div class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown"><span class="icon mdi mdi-more-vert d-inline-block d-md-none"></span></a>
                      <div class="dropdown-menu" role="menu"><a class="dropdown-item" href="#">Week</a><a class="dropdown-item" href="#">Month</a><a class="dropdown-item" href="#">Year</a>
                        <div class="dropdown-divider"></div><a class="dropdown-item" href="#">Today</a>
                      </div>
                    </div><span class="icon mdi mdi-chevron-down"></span><span class="icon toggle-loading mdi mdi-refresh-sync"></span><span class="icon mdi mdi-close"></span>
                  </div>
                  <div class="button-toolbar d-none d-md-block">
                    <div class="btn-group">
                      <button class="btn btn-secondary" type="button">Week</button>
                      <button class="btn btn-secondary active" type="button">Month</button>
                      <button class="btn btn-secondary" type="button">Year</button>
                    </div>
                    <div class="btn-group">
                      <button class="btn btn-secondary" type="button">Today</button>
                    </div>
                  </div><span class="title">Recent Movement</span>
                </div>
                <div class="widget-chart-container">
                  <div class="widget-chart-info">
                    <ul class="chart-legend-horizontal">
                      <li><span data-color="main-chart-color1"></span> Purchases</li>
                      <li><span data-color="main-chart-color2"></span> Plans</li>
                      <li><span data-color="main-chart-color3"></span> Services</li>
                    </ul>
                  </div>
                  <div class="widget-counter-group widget-counter-group-right">
                    <div class="counter counter-big">
                      <div class="value">25%</div>
                      <div class="desc">Purchase</div>
                    </div>
                    <div class="counter counter-big">
                      <div class="value">5%</div>
                      <div class="desc">Plans</div>
                    </div>
                    <div class="counter counter-big">
                      <div class="value">5%</div>
                      <div class="desc">Services</div>
                    </div>
                  </div>
                  <div id="main-chart" style="height: 260px;"></div>
                </div>
                <div class="be-spinner">
                  <svg width="40px" height="40px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                    <circle class="circle" fill="none" stroke-width="4" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
                  </svg>
                </div>
              </div>
            </div>
          </div>  
          <!-- <div class="row">
            <div class="col-12 col-lg-6">
              <div class="card">
                <div class="card-header">Latest Activity</div>
                <div class="card-body">
                  <ul class="user-timeline user-timeline-compact">
                    <li class="latest">
                      <div class="user-timeline-date">Just Now</div>
                      <div class="user-timeline-title">Create New Page</div>
                      <div class="user-timeline-description">Vestibulum lectus nulla, maximus in eros non, tristique.</div>
                    </li>
                    <li>
                      <div class="user-timeline-date">Today - 15:35</div>
                      <div class="user-timeline-title">Back Up Theme</div>
                      <div class="user-timeline-description">Vestibulum lectus nulla, maximus in eros non, tristique.</div>
                    </li>
                    <li>
                      <div class="user-timeline-date">Yesterday - 10:41</div>
                      <div class="user-timeline-title">Changes In The Structure</div>
                      <div class="user-timeline-description">Vestibulum lectus nulla, maximus in eros non, tristique.      </div>
                    </li>
                    <li>
                      <div class="user-timeline-date">Yesterday - 3:02</div>
                      <div class="user-timeline-title">Fix the Sidebar</div>
                      <div class="user-timeline-description">Vestibulum lectus nulla, maximus in eros non, tristique.</div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div> -->
        </div>
      </div>
</template>