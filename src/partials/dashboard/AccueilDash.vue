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

// const descr = computed(() => currentService.value.description);

// ==========================
// Données dynamiques
// ==========================
const API_URL = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem("token");

const sectorId = ref(null);
const doyennes = ref([]);
const totalSecteur = ref(0);
const widgetData = ref({
  est: { frere: 0, soeur: 0 },
  centre: { frere: 0, soeur: 0 },
  ouest: { frere: 0, soeur: 0 },
  total: { frere: 0, soeur: 0, est: 0, centre: 0, ouest: 0, total: 0 }
});

// SSE
let eventSource = null;

// ==========================
// Charger ID secteur courant
// ==========================
async function fetchSectorId() {
  try {
    const res = await fetch(`${API_URL}/sectors?name=${encodeURIComponent(sector.value)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const sec = data.member?.find(s => s.name === sector.value);
    if (sec) {
      sectorId.value = sec.id;
      await fetchDoyennes();
      await fetchWidgetData();
    }
  } catch (err) {
    console.error("Erreur récupération secteur", err);
  }
}

// ==========================
// Récupérer doyennes, paroisses, personnes
// ==========================
async function fetchDoyennes() {
  if (!sectorId.value) return;
  try {
    const res = await fetch(`${API_URL}/people?sector=/sectors/${sectorId.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const people = (await res.json()).member || [];
    const doyMap = {};
    people.forEach(p => {
      const doyId = p.doyenne;
      if (!doyMap[doyId]) doyMap[doyId] = { name: p.doyenneName, paroisses: [], totalEffectif: 0 };
      const effectif = p.paroisse ? 1 : 0;
      doyMap[doyId].paroisses.push({ id: p.paroisse, name: p.paroisseName, effectif });
      doyMap[doyId].totalEffectif += effectif;
    });
    doyennes.value = Object.values(doyMap);
    totalSecteur.value = people.length;
  } catch (err) {
    console.error("Erreur récupération doyennés et personnes", err);
  }
}

// ==========================
// Récupérer données pour widgets
// ==========================
async function fetchWidgetData() {
  try {
    const res = await fetch(`${API_URL}/people`, { headers: { Authorization: `Bearer ${token}` } });
    const people = (await res.json()).member || [];

    const sectorsMap = {
      est: "/api/sectors/1",
      centre: "/api/sectors/2",
      ouest: "/api/sectors/3"
    };

    Object.keys(sectorsMap).forEach(s => {
      widgetData.value[s].frere = people.filter(p => p.sector === sectorsMap[s] && p.gender === "Frère").length;
      widgetData.value[s].soeur = people.filter(p => p.sector === sectorsMap[s] && p.gender === "Soeur").length;
    });

    widgetData.value.total.frere = people.filter(p => p.gender === "Frère").length;
    widgetData.value.total.soeur = people.filter(p => p.gender === "Soeur").length;
    widgetData.value.total.est = widgetData.value.est.frere + widgetData.value.est.soeur;
    widgetData.value.total.centre = widgetData.value.centre.frere + widgetData.value.centre.soeur;
    widgetData.value.total.ouest = widgetData.value.ouest.frere + widgetData.value.ouest.soeur;
    widgetData.value.total.total = widgetData.value.total.est + widgetData.value.total.centre + widgetData.value.total.ouest;

  } catch (err) {
    console.error("Erreur récupération widget", err);
  }
}

// ==========================
// Montage SSE
// ==========================
onMounted(async () => {
  await fetchSectorId();

  // Initialiser dashboard
  window.App?.init();
  window.App?.dashboard();

  // === SSE pour mise à jour live ===
  eventSource = new EventSource(`${API_URL.replace("/api","")}/sse/people`);
  eventSource.onmessage = (event) => {
    const p = JSON.parse(event.data);

    // Mettre à jour doyennes si secteur correspond
    if (p.sector === `/sectors/${sectorId.value}`) {
      // mettre à jour doyennes
      const doy = doyennes.value.find(d => d.name === p.doyenneName);
      if (doy) {
        doy.paroisses.push({ id: p.paroisse, name: p.paroisseName, effectif: 1 });
        doy.totalEffectif += 1;
      } else {
        doyennes.value.push({ name: p.doyenneName, paroisses: [{ id: p.paroisse, name: p.paroisseName, effectif: 1 }], totalEffectif: 1 });
      }
      totalSecteur.value += 1;
    }

    // Mettre à jour widgets
    const sectorMap = { "KIN EST": "est", "KIN CENTRE": "centre", "KIN OUEST": "ouest" };
    const key = sectorMap[p.sectorName];
    if (key) {
      if (p.gender === "Frère") widgetData.value[key].frere += 1;
      if (p.gender === "Soeur") widgetData.value[key].soeur += 1;

      widgetData.value.total.frere = widgetData.value.est.frere + widgetData.value.centre.frere + widgetData.value.ouest.frere;
      widgetData.value.total.soeur = widgetData.value.est.soeur + widgetData.value.centre.soeur + widgetData.value.ouest.soeur;
      widgetData.value.total.est = widgetData.value.est.frere + widgetData.value.est.soeur;
      widgetData.value.total.centre = widgetData.value.centre.frere + widgetData.value.centre.soeur;
      widgetData.value.total.ouest = widgetData.value.ouest.frere + widgetData.value.ouest.soeur;
      widgetData.value.total.total = widgetData.value.total.est + widgetData.value.total.centre + widgetData.value.total.ouest;
    }
  };

  eventSource.onerror = (err) => {
    console.error("❌ SSE error", err);
    eventSource.close();
  };
});

onUnmounted(() => {
  if (eventSource) eventSource.close();
});

watch(() => route.params.serviceType, () => {
  fetchSectorId();
});
$(document).ready(function(){
      	//-initialize the javascript
      	App.init();
      	App.dashboard();
      });
</script>



<template>
    <div class="be-content">
        <div class="main-content container-fluid">
          <div class="row">
            <div class="col-12 col-lg-6 col-xl-3">
                        <div class="widget widget-tile">
                          <div class="chart sparkline" id="spark1"></div>
                          <div class="data-info">
                            <div class="desc">KIN EST</div>
                            <div class="value"><span class="number indicator" data-toggle="counter" :data-end="widgetData.est.frere">{{widgetData.est.frere}}</span><span class="indicator-equal mdi mdi-gender-male"></span>
                            </div>
                            <div class="value"><span class="number indicator" data-toggle="counter" :data-end="widgetData.est.soeur">{{widgetData.est.soeur}}</span><span class="indicator-negative mdi mdi-gender-male"></span>
                            </div>
                            <!-- <div class="value"><span class="number indicator" data-toggle="counter" data-end="2050">0</span><span class="indicator-positive mdi mdi-chevron-down"></span>
                            </div> -->
                          </div>
                        </div>
            </div>
            <div class="col-12 col-lg-6 col-xl-3">
                        <div class="widget widget-tile">
                          <div class="chart sparkline" id="spark2"></div>
                          <div class="data-info">
                            <div class="desc">KIN CENTRE</div>
                            <div class="value"><span class="number indicator" data-toggle="counter" :data-end="widgetData.centre.frere">{{widgetData.centre.frere}}</span><span class="indicator-equal mdi mdi-gender-male"></span>
                            </div>
                            <div class="value"><span class="number indicator" data-toggle="counter" :data-end="widgetData.centre.soeur">{{widgetData.centre.soeur}}</span><span class="indicator-negative mdi mdi-gender-male"></span>
                            </div>
                            <!-- <div class="value"><span class="number indicator" data-toggle="counter" data-end="2050">0</span><span class="indicator-positive mdi mdi-chevron-down"></span>
                            </div> -->
                          </div>
                        </div>
            </div>
            <div class="col-12 col-lg-6 col-xl-3">
                        <div class="widget widget-tile">
                          <div class="chart sparkline" id="spark3"></div>
                          <div class="data-info">
                            <div class="desc">KIN OUEST</div>
                            <div class="value"><span class="number indicator" data-toggle="counter" :data-end="widgetData.ouest.frere">{{widgetData.ouest.frere}}</span><span class="indicator-equal mdi mdi-gender-male"></span>
                            </div>
                            <div class="value"><span class="number indicator" data-toggle="counter" :data-end="widgetData.ouest.soeur">{{widgetData.ouest.soeur}}</span><span class="indicator-negative mdi mdi-gender-male"></span>
                            </div>
                            <!-- <div class="value"><span class="number indicator" data-toggle="counter" data-end="2050">0</span><span class="indicator-positive mdi mdi-chevron-down"></span>
                            </div> -->
                          </div>
                        </div>
            </div>
            <div class="col-12 col-lg-6 col-xl-3">
                        <div class="widget widget-tile">
                          <div class="chart sparkline" id="spark4"></div>
                          <div class="data-info">
                            <div class="desc">KINSHASA</div>
                            <div class="value"><span class="number indicator" data-toggle="counter" :data-end="widgetData.total.frere">{{widgetData.total.frere}}</span><span class="indicator-equal mdi mdi-gender-male"></span>
                            </div>
                            <div class="value"><span class="number indicator" data-toggle="counter" :data-end="widgetData.total.soeur">{{widgetData.total.soeur}}</span><span class="indicator-negative mdi mdi-gender-male"></span>
                            </div>
                            <!-- <div class="value"><span class="number indicator" data-toggle="counter" data-end="2050">0</span><span class="indicator-positive mdi mdi-chevron-down"></span>
                            </div> -->
                          </div>
                        </div>
            </div>
          </div>
          <div class="row">
            <div class="col-12 col-lg-4">
              <div class="card">
                <div class="card-header card-header-divider pb-3">Participation paroisse</div>
                <div class="card-body pt-5">
                  <div class="row user-progress user-progress-small">
                    <div class="col-lg-5"><span class="title">Bootstrap Admin</span></div>
                    <div class="col-lg-7">
                      <div class="progress">
                        <div class="progress-bar bg-success" style="width: 40%;"></div>
                      </div>
                    </div>
                  </div>
                  <div class="row user-progress user-progress-small">
                    <div class="col-lg-5"><span class="title">Custom Work</span></div>
                    <div class="col-lg-7">
                      <div class="progress">
                        <div class="progress-bar bg-success" style="width: 65%;"></div>
                      </div>
                    </div>
                  </div>
                  <div class="row user-progress user-progress-small">
                    <div class="col-lg-5"><span class="title">Clients Module</span></div>
                    <div class="col-lg-7">
                      <div class="progress">
                        <div class="progress-bar bg-success" style="width: 30%;"></div>
                      </div>
                    </div>
                  </div>
                  <div class="row user-progress user-progress-small">
                    <div class="col-lg-5"><span class="title">Email Templates</span></div>
                    <div class="col-lg-7">
                      <div class="progress">
                        <div class="progress-bar bg-success" style="width: 80%;"></div>
                      </div>
                    </div>
                  </div>
                  <div class="row user-progress user-progress-small">
                    <div class="col-lg-5"><span class="title">Plans Module</span></div>
                    <div class="col-lg-7">
                      <div class="progress">
                        <div class="progress-bar bg-success" style="width: 45%;"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12 col-lg-4">
              <div class="widget be-loading">
                <div class="widget-head">
                  <div class="tools"><span class="icon mdi mdi-chevron-down"></span><span class="icon mdi mdi-refresh-sync toggle-loading"></span><span class="icon mdi mdi-close"></span></div>
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