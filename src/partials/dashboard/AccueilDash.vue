<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
$(document).ready(function(){
      	//-initialize the javascript
      	App.init();
      	// App.dataTables();
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
                            <div class="value"><span class="number indicator" data-toggle="counter" data-end="240">0</span><span class="indicator-equal mdi mdi-gender-male"></span>
                            </div>
                            <div class="value"><span class="number indicator" data-toggle="counter" data-end="343">0</span><span class="indicator-negative mdi mdi-gender-male"></span>
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
                            <div class="value"><span class="number indicator" data-toggle="counter" data-end="242">0</span><span class="indicator-equal mdi mdi-gender-male"></span>
                            </div>
                            <div class="value"><span class="number indicator" data-toggle="counter" data-end="300">0</span><span class="indicator-negative mdi mdi-gender-male"></span>
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
                            <div class="value"><span class="number indicator" data-toggle="counter" data-end="313">0</span><span class="indicator-equal mdi mdi-gender-male"></span>
                            </div>
                            <div class="value"><span class="number indicator" data-toggle="counter" data-end="360">0</span><span class="indicator-negative mdi mdi-gender-male"></span>
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
                            <div class="value"><span class="number indicator" data-toggle="counter" data-end="795">0</span><span class="indicator-equal mdi mdi-gender-male"></span>
                            </div>
                            <div class="value"><span class="number indicator" data-toggle="counter" data-end="1003">0</span><span class="indicator-negative mdi mdi-gender-male"></span>
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
                  <div class="chart-pie-counter">1798</div>
                </div>
                <div class="chart-legend">
                  <table class="chart-legend">
                    <tbody>
                      <tr>
                        <td class="chart-legend-color"><span data-color="top-sales-color1"></span></td>
                        <td>KIN EST</td>
                        <td class="chart-legend-value">583</td>
                      </tr>
                      <tr>
                        <td class="chart-legend-color"><span data-color="top-sales-color2"></span></td>
                        <td>KIN CENTRE</td>
                        <td class="chart-legend-value">542</td>
                      </tr>
                      <tr>
                        <td class="chart-legend-color"><span data-color="top-sales-color3"></span></td>
                        <td>KIN OUEST</td>
                        <td class="chart-legend-value">673</td>
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