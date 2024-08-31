<template>
  <Sound sound="button-hover.m4a" :triggers="['mouseenter']">
    <Sound sound="button-navigate.m4a" :triggers="['mousedown']"><slot /></Sound>
  </Sound>
</template>
