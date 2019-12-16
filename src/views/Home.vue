<template>
<!--	<HelloWorld /> -->
	<div>
		<v-toolbar dense color="white">
			<v-toolbar-title>{{ title }}</v-toolbar-title>
			<v-spacer/>
			<v-btn fab text small @click="prev">{{"<"}}</v-btn>
			<v-btn outlined small class="mr-2 ml-2" @click="returnClick">返回</v-btn>
			<v-btn fab text small @click="next">{{">"}}</v-btn>
		</v-toolbar>

		<v-sheet height="580">
			<v-btn absolute dark fab left
				v-if="caltype==='day' && $root.caleditable"
            	color="orange"
				@click.stop="dialogsch=true,editschindex=-1"
            >
            	<v-icon>add</v-icon>
            </v-btn>

			<v-calendar
				ref="calendar"
				v-model="focus"
				color="primary"
				:show-month-on-first="false"
				@change="updateRange"
				@click:date="viewDay"
				:type="caltype"
				:first-interval="13"
				:interval-count="22"
				:interval-minutes="30"
			>
				<template v-slot:day="{ present, past, date }">
					<template v-if="trackedptz[date]">
						<v-layout column fill-height>
							<div v-for="(v,k) in colorsptz" style="height:17px">
								<v-progress-linear rounded height="17"
									:color="v"
									:value="getper(date, k)"
									:active="getper(date, k) !== undefined"
									@click="progClick(date)">
									<template v-slot="{ value }">
										<span class="caption">{{ getstr(date, k) }}</span>
									</template>
								</v-progress-linear>
							</div>
						</v-layout>
					</template>
				</template>
				
				<template v-slot:day-body="{ date, timeToY, minutesToPixels }">
					<!-- <template v-for="(event,idx) in eventsMap2()[date]">
						<div
							v-if="event.time"
							:key="idx"
							:style="{ top: timeToY(event.time) + 'px', height: minutesToPixels(event.duration) + 'px', width:'50px', left: idx * 55 + 'px'}"
							class="my-event with-time"
							v-html="event.title"
						></div>
					-->
						<template v-for="(event,idx) in getEvents(date)">
						<div
							:key="idx"
							:style="{
								top: timeToY(event.starttime) + 'px',
								height: minutesToPixels(event.duration) + 'px',
								width:'50px',
								left: idx * 55 + 'px',
								backgroundColor: event.color
							}"
							class="my-event with-time text-center"
							@click.stop="editsch(date,idx)"
						>{{event.gender ? event.gender+event.product : ''}}</div>
					</template>
				</template>
				
			</v-calendar>
		</v-sheet>

		<div style="width:60%;">
			<v-container grid-list-md text-center>
				<v-layout wrap>
					<v-flex xs3>
						图例
					</v-flex>
					<v-flex xs3>
						<v-card dark :color="colorsptz.t">
							<v-card-text class="pa-0">T日</v-card-text>
						</v-card>
					</v-flex>
					<v-flex xs3>
						<v-card dark :color="colorsptz.p">
							<v-card-text class="pa-0">P日</v-card-text>
						</v-card>
					</v-flex>
					<v-flex xs3>
						<v-card dark :color="colorsptz.z">
							<v-card-text class="pa-0">Z日</v-card-text>
						</v-card>
					</v-flex>
				</v-layout>
			</v-container>
		</div>

		<v-dialog persistent v-model="dialogsch" width="360">
			<v-card>
				<v-card-title>编辑{{curdate}}</v-card-title>
				<v-card-text>
					<v-form ref="formsch">
						<v-btn-toggle mandatory v-model="curptz">
							<v-flex>
								<v-btn class="mx-2" active-class="red white--text" rounded>T日</v-btn>
								<v-btn class="mx-2" active-class="blue white--text" rounded>P日</v-btn>
								<v-btn class="mx-2" active-class="green white--text" rounded>Z日</v-btn>
							</v-flex>
						</v-btn-toggle>
						<v-container grid-list-xl>
							<v-layout>
								<v-flex>
									<v-select :items="starttimes" label="开始时间" v-model="starttime" noDataText=""></v-select>
									<v-select :items="durations" label="预计用时(分钟)" v-model="duration" noDataText=""></v-select>
									<v-select :items="genders" label="性别" v-model="gender" noDataText=""></v-select>
									<v-select :items="products" label="产品" v-model="product" noDataText=""></v-select>
								</v-flex>
							</v-layout>
						</v-container>
					</v-form>
				</v-card-text>
				<v-card-actions>
					<v-btn color="primary" text @click.stop="deletesch">删除</v-btn>
					<v-spacer/>
					<v-btn color="primary" text @click.stop="savesch">保存</v-btn>
					<v-btn color="primary" text @click.stop="dialogsch=false">取消</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog persistent v-model="dialog" width="500">
			<v-card>
				<v-card-title>修改{{curdate}}</v-card-title>
				<v-card-text>
					<v-form ref="form">
					<v-container grid-list-xl>
						<v-layout>
							<v-flex>
								<v-text-field label="已预约T" v-model="t0" :rules="rNum"></v-text-field>
							</v-flex>
							<v-flex class="text-center">
								<v-btn icon small @click.stop="()=>{if (t1>0) {--t1;++t0;}}"><v-icon>arrow_back</v-icon></v-btn>
								<v-btn icon small @click.stop="()=>{if (t0>0) {--t0;++t1;}}"><v-icon>arrow_forward</v-icon></v-btn>
							</v-flex>
							<v-flex>
								<v-text-field label="可预约T" v-model="t1" :rules="rNum"></v-text-field>
							</v-flex>
						</v-layout>
						<v-layout>
							<v-flex>
								<v-text-field label="已预约P" v-model="p0" :rules="rNum"></v-text-field>
							</v-flex>
							<v-flex class="text-center">
								<v-btn icon small @click.stop="()=>{if (p1>0) {--p1;++p0;}}"><v-icon>arrow_back</v-icon></v-btn>
								<v-btn icon small @click.stop="()=>{if (p0>0) {--p0;++p1;}}"><v-icon>arrow_forward</v-icon></v-btn>
							</v-flex>
							<v-flex>
								<v-text-field label="可预约P" v-model="p1" :rules="rNum"></v-text-field>
							</v-flex>
						</v-layout>
						<v-layout>
							<v-flex>
								<v-text-field label="已预约Z" v-model="z0" :rules="rNum"></v-text-field>
							</v-flex>
							<v-flex class="text-center">
								<v-btn icon small @click.stop="()=>{if (z1>0) {--z1;++z0;}}"><v-icon>arrow_back</v-icon></v-btn>
								<v-btn icon small @click.stop="()=>{if (z0>0) {--z0;++z1;}}"><v-icon>arrow_forward</v-icon></v-btn>
							</v-flex>
							<v-flex>
								<v-text-field label="可预约Z" v-model="z1" :rules="rNum"></v-text-field>
							</v-flex>
						</v-layout>
					</v-container>
					</v-form>
				</v-card-text>
				<v-card-actions>
					<v-spacer/>
					<v-btn color="primary" text @click.stop="saveform">保存</v-btn>
					<v-btn color="primary" text @click.stop="dialog=false">取消</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-snackbar v-model="snackbar" :color="snackbarcolor">
      		{{ snackbarmsg }}
    	</v-snackbar>
	</div>
</template>

<script>
import HelloWorld from '../components/HelloWorld';

export default {
	data: () => ({
		caltype: 'month',
		focus: '',
		trackedptz: {},
		colorsptz: {
			t: '#FF6464',
			p: '#42A5F5',
			z: '#90D090'
		},
		dialog: false,
		curdate: '',
		title: '',
		t0: 1,
		t1: 2,
		p0: 3,
		p1: 4,
		z0: 5,
		z1: 6,
		rNum: [v => v.length === 0 || !isNaN(parseInt(v)) || '不是有效的数字'],
		snackbar: false,
		snackbarmsg: '',
		snackbarcolor: 'success',
		dialogsch: false,
		editschindex: -1,
		curptz:0,
		starttime:'',
		duration:0,
		gender:'',
		product:'',
		starttimes:["8:00","8:30","9:00","9:30","10:00","10:30","11:00","11:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"],
		durations:[30,60,90,120],
		genders:['男','女'],
		products:['T','W','C']
	}),
	mounted() {
		this.setToday();
	},
	methods: {
		deletesch() {
			if (!this.trackedptz[this.curdate] || !this.trackedptz[this.curdate].events) return;
			this.trackedptz[this.curdate].events.splice(this.editschindex, 1);
			this.$axios.post('/api/events', {
				date: this.curdate,
				events: this.trackedptz[this.curdate].events
			}).then(response=>{
			}).catch(error => {
				console.dir(error);
			}).finally(()=>{
				this.dialogsch = false;
			});
		},
		editsch(date,idx) {
			if (!this.$root.caleditable) return;
			const s = this.trackedptz[date];
			if (!s || !s.events || !s.events[idx]) return;
			this.editschindex = idx;
			const es = s.events[idx];
			this.curptz = {t:0,p:1,z:2}[es.ptz];
			this.starttime = es.starttime;
			this.duration = es.duration;
			this.gender = es.gender;
			this.product = es.product;
			this.dialogsch = true;
		},
		savesch() {
			if (this.starttime === '' || this.duration === 0 || this.gender === '' || this.product === '') return;
			if (!this.curdate || !this.trackedptz[this.curdate]) return;
			if (!this.trackedptz[this.curdate].events) this.trackedptz[this.curdate].events = [];
			const e = {
				ptz: ['t','p','z'][this.curptz],
				starttime: this.starttime,
				duration: this.duration,
				gender: this.gender,
				product: this.product
			};
			if (this.editschindex < 0) {
				this.trackedptz[this.curdate].events.push(e);
			} else if (this.trackedptz[this.curdate].events[this.editschindex]) {
				this.trackedptz[this.curdate].events[this.editschindex] = e;
			}
			this.trackedptz[this.curdate].events.sort((a,b)=>{
				if (a.ptz === b.ptz) {
					return parseInt(a.starttime.replace(':','')) - parseInt(b.starttime.replace(':',''));
				} else {
					return a.ptz.charCodeAt() - b.ptz.charCodeAt();
				}
			});
			this.$axios.post('/api/events', {
				date: this.curdate,
				events: this.trackedptz[this.curdate].events
			}).then(response=>{
			}).catch(error => {
				console.dir(error);
			}).finally(()=>{
				this.dialogsch = false;
			});
		},
		getEvents(date) {
			if (!this.trackedptz[date]) return [];
			let schs = this.trackedptz[date].events;
			if (!schs || schs.length === 0) return [];
			const r = schs.map(v=>{ v.color = this.colorsptz[v.ptz]; return v;});
			return r;
		},
		progClick(e) {
			this.focus = e;
			this.curdate = e;
			this.caltype = 'day';
		},
		returnClick() {
			if (this.caltype !== 'month') {
				this.caltype = "month";
			}
			this.setToday();
		},
		setToday () {
			this.focus = new Date().toISOString().substring(0,10);
		},
		prev () {
			this.$refs.calendar.prev();
		},
		next () {
			this.$refs.calendar.next();
		},
		updateRange({start, end}) {
			this.title = start.year + '年' + start.month + '月';
			this.fetchdata(start.date);
		},
		viewDay({date}) {
			if (!this.$root.caleditable) return;
			this.curdate = date;
			if (this.trackedptz[this.curdate]) {
				this.t0 = this.trackedptz[this.curdate].t[0];
				this.t1 = this.trackedptz[this.curdate].t[1];
				this.p0 = this.trackedptz[this.curdate].p[0];
				this.p1 = this.trackedptz[this.curdate].p[1];
				this.z0 = this.trackedptz[this.curdate].z[0];
				this.z1 = this.trackedptz[this.curdate].z[1];
			} else {
				this.t0 = '';
				this.t1 = '';
				this.p0 = '';
				this.p1 = '';
				this.z0 = '';
				this.z1 = '';
			}
			this.dialog = true;
		},
		saveform() {
			if (this.t0+this.t1+this.p0+this.p1+this.z0+this.z1 === '') {
				this.dialog = false;
				return;
			}
			this.t0 = this.t0 === '' ? 0 : parseInt(this.t0);
			this.t1 = this.t1 === '' ? 0 : parseInt(this.t1);
			this.p0 = this.p0 === '' ? 0 : parseInt(this.p0);
			this.p1 = this.p1 === '' ? 0 : parseInt(this.p1);
			this.z0 = this.z0 === '' ? 0 : parseInt(this.z0);
			this.z1 = this.z1 === '' ? 0 : parseInt(this.z1);
			if (!this.$refs.form.validate()) {
				return;
			}
			this.$axios.post('/api/data', {
					date:	this.curdate,
					t0:		this.t0,
					t1:		this.t1,
					p0:		this.p0,
					p1:		this.p1,
					z0:		this.z0,
					z1:		this.z1
				}).then(response=>{
					this.snackbarcolor = 'success';
					this.snackbarmsg = '保存成功';
					this.trackedptz[this.curdate] = {p:[this.p0,this.p1],t:[this.t0,this.t1],z:[this.z0,this.z1]};
				}).catch(error => {
					console.dir(error);
					this.snackbarcolor = 'error';
					this.snackbarmsg = error.message;
				}).finally(()=>{
					this.snackbar = true;
					this.dialog = false;
				});
		},
		fetchdata(startdate) {
			this.$axios.get('/api/data',{params:{date:startdate}})
				.then(response=>{
					let r = response.data.reduce((acc, cur)=>{
						acc[cur.date]={p:[cur.p_used,cur.p_avl],t:[cur.t_used,cur.t_avl],z:[cur.z_used,cur.z_avl],events:JSON.parse(cur.events)};
						return acc;
					}, {});
					this.trackedptz = r;
				}).catch(error => {
					console.dir(error);
				});
		},
		getper(date, ptz) {
			let v = this.trackedptz[date];
			if (!v || !v[ptz] || (v[ptz][0] + v[ptz][1] === 0)) return undefined;
			return 100 * v[ptz][0] / (v[ptz][0] + v[ptz][1]);
		},
		getstr(date, ptz) {
			let v = this.trackedptz[date];
			if (!v || !v[ptz]) return "";
			return v[ptz][0] + " / " + v[ptz][1];
		},
	},
	computed: {
	},
	components: {
			HelloWorld,
	},
};
</script>

<style>
.my-event {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 3px;
  background-color: #1867c0;
  color: #ffffff;
  border: 1px solid #ffffff;
  font-size: 12px;
  padding: 3px;
  cursor: pointer;
  margin-bottom: 1px;
  left: 4px;
  margin-right: 8px;
  position: relative;
}

.my-event.with-time {
  position: absolute;
  right: 4px;
  margin-right: 0px;
}
</style>