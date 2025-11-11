<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useServiceContext } from '@/composables/useServiceContext';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

// ==========================
// Variables principales
// ==========================
const route = useRoute();
const { currentService } = useServiceContext();   

const sectorService = computed(() => route.params.serviceType || currentService.value.position);
const sector = computed(() => {
  if (sectorService.value === "est") return "KIN EST";
  if (sectorService.value === "centre") return "KIN CENTRE";
  if (sectorService.value === "ouest") return "KIN OUEST";
  return "KIN EST";
});

const statsTime = ref({
  today: { est: 0, centre: 0, ouest: 0, total: 0 },
  week: { est: 0, centre: 0, ouest: 0, total: 0 },
  month: { est: 0, centre: 0, ouest: 0, total: 0 },
  year: { est: 0, centre: 0, ouest: 0, total: 0 },
  globalTotal: 0
});
const currentFilter = ref('month'); // filtre par défaut
const widgetData = ref({
  est: { frere: 0, soeur: 0 },
  centre: { frere: 0, soeur: 0 },
  ouest: { frere: 0, soeur: 0 },
  total: { frere: 0, soeur: 0, est: 0, centre: 0, ouest: 0, total: 0 }
});

const sectorRef = ref(null);
const doyennes = ref([]);
const totalSecteur = ref(0);
const topParoisses = ref([]);
const chart = ref(null);
const eventSource = ref(null);
const API_URL = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem("token");

// ==========================
// PAGINATION OPTIMISÉE
// ==========================
async function fetchAllPages(baseUrl, options = {}) {
  let allItems = [];
  let currentPage = 1;
  let hasMore = true;
  
  try {
    while (hasMore) {
      const url = new URL(baseUrl);
      url.searchParams.set('page', currentPage);
      
      const response = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.member && Array.isArray(data.member)) {
        allItems = [...allItems, ...data.member];
        
        // Vérifie s'il y a plus de pages
        if (data.member.length === 0 || 
            data.member.length < 30 ||
            currentPage >= 50) {
          hasMore = false;
        } else {
          currentPage++;
        }
      } else {
        hasMore = false;
      }
    }
    
    console.log(`📊 ${baseUrl} - ${allItems.length} enregistrements chargés`);
    return allItems;
  } catch (error) {
    console.error('Erreur lors de la récupération paginée:', error);
    throw error;
  }
}

// ==========================
// Helpers
// ==========================
function normalizeRef(ref) {
  if (!ref) return "";
  try {
    const u = new URL(ref, "http://example.invalid");
    return u.pathname.replace(/\/+$/, "");
  } catch {
    return String(ref).replace(/^https?:\/\/[^/]+/, "").replace(/\/+$/, "");
  }
}

// ==========================
// Mise à jour Widget et Stats
// ==========================
function updateWidgetData(people) {
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

  widgetData.value.total.frere = widgetData.value.est.frere + widgetData.value.centre.frere + widgetData.value.ouest.frere;
  widgetData.value.total.soeur = widgetData.value.est.soeur + widgetData.value.centre.soeur + widgetData.value.ouest.soeur;
  widgetData.value.total.est = widgetData.value.est.frere + widgetData.value.est.soeur;
  widgetData.value.total.centre = widgetData.value.centre.frere + widgetData.value.centre.soeur;
  widgetData.value.total.ouest = widgetData.value.ouest.frere + widgetData.value.ouest.soeur;
  widgetData.value.total.total = widgetData.value.total.est + widgetData.value.total.centre + widgetData.value.total.ouest;
}

function updateTimeStats(people) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday); startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const counters = {
    today: { est: 0, centre: 0, ouest: 0, total: 0 },
    week: { est: 0, centre: 0, ouest: 0, total: 0 },
    month: { est: 0, centre: 0, ouest: 0, total: 0 },
    year: { est: 0, centre: 0, ouest: 0, total: 0 },
  };

  people.forEach(p => {
    const created = new Date(p.createdAt);
    const secRef = normalizeRef(p.sector || p.sectorName || "");
    
    let key = null;
    if (secRef.includes("/sectors/1") || secRef.includes("KIN EST")) key = "est";
    else if (secRef.includes("/sectors/2") || secRef.includes("KIN CENTRE")) key = "centre";
    else if (secRef.includes("/sectors/3") || secRef.includes("KIN OUEST")) key = "ouest";

    if (!key) return;

    if (created >= startOfToday) { counters.today[key]++; counters.today.total++; }
    if (created >= startOfWeek)  { counters.week[key]++; counters.week.total++; }
    if (created >= startOfMonth) { counters.month[key]++; counters.month.total++; }
    if (created >= startOfYear)  { counters.year[key]++; counters.year.total++; }
  });

  statsTime.value = {
    ...counters,
    globalTotal: people.length
  };
}

// ==========================
// Récupération API avec pagination
// ==========================
async function fetchWidgetData() {
  try {
    const people = await fetchAllPages(`${API_URL}/people`);
    console.log('📊 Personnes chargées pour les widgets:', people.length);
    
    updateWidgetData(people);
    updateTimeStats(people);
  } catch (err) {
    console.error("Erreur fetchWidgetData:", err);
  }
}

async function fetchSectorId() {
  try {
    const res = await fetch(`${API_URL}/sectors?name=${encodeURIComponent(sector.value)}`, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    const data = await res.json();
    const sec = data.member?.find(s => s.name === sector.value);
    sectorRef.value = sec ? normalizeRef(sec['@id'] || sec.id) : null;
    await fetchDoyennes();
  } catch(err) {
    console.error("Erreur fetchSectorId:", err);
    sectorRef.value = null;
  }
}

async function fetchParoissesBySector() {
  if(!sectorRef.value) return [];
  try {
    const paroisses = await fetchAllPages(`${API_URL}/paroisses?sector=${encodeURIComponent(sectorRef.value)}`);
    return paroisses.map(p => ({ 
      id: normalizeRef(p['@id']||p.id), 
      name: p.name||p.fullName||"Paroisse inconnue", 
      raw: p 
    }));
  } catch(err) {
    console.error("Erreur fetchParoissesBySector:", err);
    return [];
  }
}

async function fetchDoyennes() {
  if(!sectorRef.value) { 
    doyennes.value = []; 
    topParoisses.value = []; 
    totalSecteur.value = 0; 
    return; 
  }
  
  try {
    const people = await fetchAllPages(`${API_URL}/people?sector=${encodeURIComponent(sectorRef.value)}`);
    console.log('📊 Personnes du secteur chargées:', people.length);
    
    const doyMap = {}, paroMap = {};
    people.forEach(p => {
      const doyKey = normalizeRef(p.doyenne)||"";
      const paroKey = normalizeRef(p.paroisse)||"";
      if(!doyMap[doyKey]) doyMap[doyKey] = {
        id: doyKey, 
        name: p.doyenneName||"Doyenné inconnu", 
        paroisses: [], 
        totalEffectif: 0
      };
      if(paroKey) { 
        doyMap[doyKey].paroisses.push({
          id: paroKey,
          name: p.paroisseName||null,
          effectif: 1
        });
        doyMap[doyKey].totalEffectif += 1;
        if(!paroMap[paroKey]) paroMap[paroKey] = {
          id: paroKey,
          name: p.paroisseName||null,
          effectif: 0
        };
        paroMap[paroKey].effectif += 1;
      }
    });
    
    totalSecteur.value = people.length;
    const paroissesSecteur = await fetchParoissesBySector();
    
    paroissesSecteur.forEach(par => {
      const key = par.id;
      if(!paroMap[key]) paroMap[key] = {
        id: key,
        name: par.name,
        effectif: 0
      };
      else if(!paroMap[key].name) paroMap[key].name = par.name;
    });
    
    doyennes.value = Object.values(doyMap);
    topParoisses.value = Object.values(paroMap).sort((a,b) => b.effectif - a.effectif).slice(0,5);
    
    console.log('📊 Doyennés trouvés:', doyennes.value.length);
    console.log('📊 Top paroisses:', topParoisses.value.length);
    
  } catch(err) {
    console.error("Erreur fetchDoyennes:", err);
    doyennes.value = []; 
    topParoisses.value = []; 
    totalSecteur.value = 0;
  }
}

// ==========================
// SSE - live update
// ==========================
function initSSE() {
  try { 
    eventSource.value = new EventSource(`${API_URL.replace("/api","")}/sse/people`); 
  } catch { 
    eventSource.value = null; 
  }
  
  if(!eventSource.value) return;
  
  eventSource.value.onmessage = async event => {
    const p = JSON.parse(event.data||"{}");
    if(sectorRef.value && normalizeRef(p.sector) === sectorRef.value) await fetchDoyennes();
    updateWidgetData([p]);
  };
  
  eventSource.value.onerror = err => { 
    console.error("SSE error:", err); 
    try { 
      eventSource.value.close(); 
    } catch { 
      return; 
    } 
  };
}

// ==========================
// Chart & Lifecycle
// ==========================
onMounted(async () => {
  await fetchSectorId();
  await fetchWidgetData();

  const ctx = document.getElementById('main-chart');
  if (ctx) {
    chart.value = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['KIN EST', 'KIN CENTRE', 'KIN OUEST'],
        datasets: [{
          data: [
            statsTime.value[currentFilter.value].est,
            statsTime.value[currentFilter.value].centre,
            statsTime.value[currentFilter.value].ouest
          ],
          backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc']
        }]
      },
      options: {
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: ctx => {
                const dataset = ctx.dataset.data;
                const total = dataset.reduce((a, b) => a + Number(b), 0);
                const value = Number(ctx.raw);
                const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${ctx.label}: ${value} (${percent}%)`;
              }
            }
          }
        }
      }
    });
  }

  initSSE();
});

onUnmounted(() => { 
  if(eventSource.value) eventSource.value.close(); 
});

// Mettre à jour chart automatiquement
watch(widgetData, newVal => {
  if (chart.value) {
    chart.value.data.datasets[0].data = [
      newVal.total.est,
      newVal.total.centre,
      newVal.total.ouest
    ];
    chart.value.update();
  }
}, { deep: true });

// ==========================
// Filtre flow
// ==========================
function setFilter(filter){ currentFilter.value = filter; }
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
                <span class="number indicator" data-toggle="counter" >{{widgetData[d.k].frere}}</span>
                <span class="indicator-equal mdi mdi-male-alt"></span>
              </div>
              <div class="value" v-if="d.k!=='total'">
                <span class="number indicator" data-toggle="counter" :data-end="widgetData[d.k].soeur">{{widgetData[d.k].soeur}}</span>
                <span class="indicator-negative mdi mdi-female"></span>
              </div>

              <div class="value" v-if="d.k==='total'">
                <span class="number indicator" data-toggle="counter" :data-end="widgetData.total.frere">{{widgetData.total.frere}}</span>
                <span class="indicator-equal mdi mdi-male-alt"></span>
              </div>
              <div class="value" v-if="d.k==='total'">
                <span class="number indicator" data-toggle="counter" :data-end="widgetData.total.soeur">{{widgetData.total.soeur}}</span>
                <span class="indicator-negative mdi mdi-female"></span>
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
            <div class="widget-head d-flex justify-content-between align-items-center">
              <span class="title">Flow d'enregistrement</span>
              <div class="btn-group">
                <button class="btn btn-secondary" :class="{active: currentFilter==='week'}" @click="setFilter('week')">Semaine</button>
                <button class="btn btn-secondary" :class="{active: currentFilter==='month'}" @click="setFilter('month')">Mois</button>
                <button class="btn btn-secondary" :class="{active: currentFilter==='year'}" @click="setFilter('year')">Année</button>
                <button class="btn btn-secondary" :class="{active: currentFilter==='today'}" @click="setFilter('today')">Aujourd'hui</button>
              </div>
            </div>

            <div class="widget-chart-container mt-3">
              <div class="widget-counter-group widget-counter-group-right d-flex justify-content-around">
                <div class="counter counter-big">
                  <div class="value">{{ statsTime[currentFilter].total || 0 }} / {{ statsTime.globalTotal }}</div>
                  <div class="desc">Total</div>
                </div>
                <div class="counter counter-big">
                  <div class="value">
                    {{ isFinite((statsTime[currentFilter].est / statsTime[currentFilter].total) * 100)
                    ? ((statsTime[currentFilter].est / statsTime[currentFilter].total) * 100).toFixed(1) + '%'
                    : '... %' }}
                  </div>
                  <div class="desc">KIN EST</div>
                </div>
                <div class="counter counter-big">
                  <div class="value">
                    {{ isFinite((statsTime[currentFilter].centre / statsTime[currentFilter].total) * 100)
                    ? ((statsTime[currentFilter].centre / statsTime[currentFilter].total) * 100).toFixed(1) + '%'
                    : '... %' }}
                  </div>
                  <div class="desc">KIN CENTRE</div>
                </div>
                <div class="counter counter-big">
                  <div class="value">
                    {{ isFinite((statsTime[currentFilter].ouest / statsTime[currentFilter].total) * 100)
                    ? ((statsTime[currentFilter].ouest / statsTime[currentFilter].total) * 100).toFixed(1) + '%'
                    : '... %' }}
                  </div>
                  <div class="desc">KIN OUEST</div>
                </div>
              </div>

              <div class="chart-title text-center mb-2">
                Graphique du mois encours
              </div>
              <canvas id="main-chart"></canvas>
            </div>
          </div>
        </div>
      </div>  
    </div>
  </div>
</template>

<style scoped>
#main-chart {
  width: 35rem;    /* largeur souhaitée */
  height: 35rem;   /* hauteur souhaitée */
  margin: 0 auto;  /* centrer horizontalement */
}
.chart-title {
  font-weight: bold;
  font-size: 1.2rem;
  color: #333;
}
</style>