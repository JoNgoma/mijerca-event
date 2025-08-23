<template>
  <ul class="navbar-nav">
    <li class="nav-item dropdown">
      <a class="nav-link dropdown-toggle text-primary" href="#" data-toggle="dropdown" role="button" aria-expanded="false">
        Communiqués <span class="mdi mdi-caret-down"></span>
      </a>
      <div class="dropdown-menu" role="menu">
        <router-link :to="{ name: 'list' }" class="dropdown-item">Niveau diocésain</router-link>
        <router-link :to="{ name: 'list' }" class="dropdown-item">Niveau décanal</router-link>
        <router-link :to="{ name: 'list' }" class="dropdown-item">Niveau paroissial</router-link>
        <router-link :to="{ name: 'list' }" class="dropdown-item">Tous</router-link>
      </div>
    </li>
    <li class="nav-item">
      <router-link :to="{ name: 'composer' }" class="nav-link">New communiqué</router-link>
    </li>
  </ul>
</template>