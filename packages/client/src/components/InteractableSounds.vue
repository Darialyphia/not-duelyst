<template>
  <Sound sound="button-hover" :triggers="['mouseenter']">
    <Sound sound="button-click" :triggers="['mousedown']"><slot /></Sound>
  </Sound>
</template>
