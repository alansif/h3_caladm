<template>
  <v-app>
	  <!--
	<v-app-bar app>
	  <v-toolbar-title class="headline text-uppercase">
		<span>Vuetify</span>
		<span class="font-weight-light">MATERIAL DESIGN</span>
	  </v-toolbar-title>
	  <v-spacer></v-spacer>
	  <v-btn
		text
		href="https://github.com/vuetifyjs/vuetify/releases/latest"
		target="_blank"
	  >
		<span class="mr-2">Latest Release</span>
		<v-icon>mdi-open-in-new</v-icon>
	  </v-btn>
	</v-app-bar>
	-->
	<v-navigation-drawer app clipped v-model="drawer">
		<v-list>
			<v-list-item to="/home">
				<v-list-item-action>
					<v-icon>date_range</v-icon>
				</v-list-item-action>
				<v-list-item-content>
					<v-list-item-title>日历</v-list-item-title>
				</v-list-item-content>
			</v-list-item>
			<v-list-item to="/table">
				<v-list-item-action>
					<v-icon>list</v-icon>
				</v-list-item-action>
				<v-list-item-content>
					<v-list-item-title>数据</v-list-item-title>
				</v-list-item-content>
			</v-list-item>
			<v-list-item to="/logs">
				<v-list-item-action>
					<v-icon>history</v-icon>
				</v-list-item-action>
				<v-list-item-content>
					<v-list-item-title>变更记录</v-list-item-title>
				</v-list-item-content>
			</v-list-item>
		</v-list>
	</v-navigation-drawer>
	<v-app-bar app dense clipped-left dark color="amber darken-4">
		<v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
		<v-toolbar-title>
			华三运营日历
		</v-toolbar-title>
	</v-app-bar>
	<v-content>
		<Login></Login>
		<transition name="fade">
	  		<router-view/>
		</transition>
	</v-content>
  </v-app>
</template>

<script>
import Login from './components/Login'
export default {
  name: 'App',
  data: () => ({
	  drawer: null
  }),
  mounted() {
	  localStorage.clear();
  },
  components: {
	  Login
  }
};
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition-property: opacity;
  transition-duration: .15s;
}
.fade-enter-active {
  transition-delay: .15s;
}
.fade-enter, .fade-leave-active {
  opacity: 0
}
</style>