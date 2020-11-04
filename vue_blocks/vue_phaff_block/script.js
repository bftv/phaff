/* Main URLs */
phaffDbUrl = "https://web.bftv.ucdavis.edu:8080/phaff/getrecord";
const blockID = document.getElementsByClassName('vue-phaff-block')[0].id;
/* End Main URLs */


/* Components */

var recordList = Vue.extend({
    template: '#record-list-template',

    data: function() {
        return {
            recordsData: null,
			filteredData: null,
			singleItem: null,
			loading: true,
			currentPage: 0,
			pageSize: 50,
			visibleRecords: [],
			s_strain_id: null,
			s_genus: null,
			s_species: null,
			s_source_habitat_category: null,
			s_source_habitat: null,
			s_cbs_number: null,
			s_atcc_number: null,
			s_nrrl_number: null,
			s_other_collection_numbers: null,
			s_synonym: null,
			s_geographic_origin: null,
			s_source_country: null,
			s_source_name: null,
			s_date_of_isolation: null,
			genus_set: null,
			habitat_category_set: null,
			cart: [],
			viewMode: "list",
			filters: {},
			scrollPosition: 0,
			moreFields: false,
			tempIndex: ''
        }
    },
	
	mounted: function() {
		//this.pageSize = drupalSettings.pdb.configuration[blockID].recordsPerPage,
		this.emptyCart(),
		this.getRecordsList(phaffDbUrl)
	},

    methods: {
        getRecordsList: function(url){
				axios.get(url).then(response => {			
				this.recordsData = response.data,
				this.filteredData = response.data,
				this.updateVisibleRecords(),
				this.genus_set = [...new Set(this.recordsData.map(g => g.genus))].sort(Intl.Collator().compare),
				//this.genus_set.sort(function (a, b) {
				//	return a.toLowerCase().localeCompare(b.toLowerCase())
				//}),
				this.habitat_category_set = [...new Set(this.recordsData.map(g => g.source_habitat_category))].sort(Intl.Collator().compare),				
				this.loading = false				
			})
		},
		updatePage: function(pageNumber){
			this.currentPage = pageNumber;
			this.updateVisibleRecords();
		},
		updateVisibleRecords: function(){
			this.visibleRecords = this.filteredData.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
			if(this.visibleRecords.length == 0 && this.currentPage > 0) {
				this.updatePage(this.currentPage - 1);
			}
		},
		totalPages: function() {
			return Math.ceil(this.filteredData.length / this.pageSize);
		},
		showPreviousLink: function() {
			return this.currentPage == 0 ? false : true;
		},
		showNextLink: function() {
			return this.currentPage == (this.totalPages() - 1) ? false : true;
		},
		search: function(){			
			this.loading = true;	
			if(this.s_strain_id){				
				Object.assign(this.filters, {strain_id: this.s_strain_id})
			}			
			if(this.s_genus && this.s_genus != " "){
				Object.assign(this.filters, {genus: this.s_genus})
			} else if(this.s_genus == " "){
				this.filters = this.deleteProps(this.filters, 'genus');
			}
			if(this.s_species){
				Object.assign(this.filters, {species: this.s_species})
			}
			if(this.s_source_habitat_category && this.s_source_habitat_category != ""){
				Object.assign(this.filters, {source_habitat_category: this.s_source_habitat_category})
			} else if(this.s_source_habitat_category == " "){
				this.filters = this.deleteProps(this.filters, 'source_habitat_category');
			}
			if(this.s_source_habitat){
				Object.assign(this.filters, {source_habitat: this.s_source_habitat})
			}
			if(this.s_cbs_number){
				Object.assign(this.filters, {cbs_number: this.s_cbs_number})
			}
			if(this.s_atcc_number){
				Object.assign(this.filters, {atcc_number: this.s_atcc_number})
			}
			if(this.s_nrrl_number){
				Object.assign(this.filters, {nrrl_number: this.s_nrrl_number})
			}
			if(this.s_other_collection_numbers){
				Object.assign(this.filters, {other_collection_numbers: this.s_other_collection_numbers})
			}
			if(this.s_synonym){
				Object.assign(this.filters, {synonym: this.s_synonym})
			}
			if(this.s_geographic_origin){
				Object.assign(this.filters, {geographic_origin: this.s_geographic_origin})
			}
			if(this.s_source_country){
				Object.assign(this.filters, {source_country: this.s_source_country})
			}
			if(this.s_source_name){
				Object.assign(this.filters, {source_name: this.s_source_name})
			}
			if(this.s_date_of_isolation){
				Object.assign(this.filters, {date_of_isolation: this.s_date_of_isolation})
			}
			this.filteredData = this.multiFilter(this.recordsData, this.filters),
			this.updateVisibleRecords(),
			this.loading = false
		},
		deleteProps: function(obj, props){
			if (!Array.isArray(props)) props = [props];
			return Object.keys(obj).reduce((newObj, prop) => {
				if (!props.includes(prop)) {
					newObj[prop] = obj[prop];
				}
				return newObj;
			}, {});
		},
		multiFilter: function(array, filters){
			const filterKeys = Object.keys(filters);
			return array.filter((item) => {
				return filterKeys.every(key => {
					if (!filters[key].length) return true;
					return item[key].toLowerCase().includes(filters[key].toLowerCase());
				});
			});
		},
		clearSearch: function(){
			this.s_strain_id = null,
			this.s_genus = null,
			this.s_species = null,
			this.s_source_habitat_category = null,
			this.s_source_habitat = null,
			this.s_cbs_number = null,
			this.s_atcc_number = null,
			this.s_nrrl_number = null,
			this.s_other_collection_numbers = null,
			this.s_synonym = null,
			this.s_geographic_origin = null,
			this.s_source_country = null,
			this.s_source_name = null,
			this.s_date_of_isolation = null,
			this.filters = {},
			this.filteredData = this.recordsData,
			this.updateVisibleRecords()
		},
		addToCart: function(id){
			this.cart.push({StrainID: this.visibleRecords[id].strain_id, Genus: this.visibleRecords[id].genus, Species: this.visibleRecords[id].species})
		},
		addToCartFull: function(id){
			id = this.tempIndex,
			this.cart.push({StrainID: this.visibleRecords[id].strain_id, Genus: this.visibleRecords[id].genus, Species: this.visibleRecords[id].species})
		},
		showCart: function(){
			this.viewMode = "cart"
		},
		showList: function(){
			this.viewMode = "list";
			if(this.scrollPosition != 0) {
				window.scrollTo(0, this.scrollPosition)
			}
			this.singleItem = null			
		},
		removeItem: function(index){
			this.cart.splice(index, 1)
		},
		showSingleItem: function(index){
			this.scrollPosition = document.documentElement.scrollTop,
			this.viewMode = "single",
			window.scrollTo(0, 200),
			this.singleItem = this.visibleRecords[index],
			this.tempIndex = index
		},
		checkOut: function(){
			document.cookie = "phaff="+JSON.stringify(this.cart),
			window.location.href = '/form/checkout?checkout=true'
		},
		emptyCart: function(){
			this.cart = [],
			document.cookie = "phaff=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
		},
		getCookie: function(name) {
			value = "; " + document.cookie,
			parts = value.split("; " + name + "=");
			if (parts.length == 2) return parts.pop().split(";").shift()
		},
		showMoreFields: function() {
			this.moreFields = true
		},
		hideMoreFields: function() {
			this.moreFields = false
		}
	},
})


/* End Components */

/* Router */

var router = new VueRouter({
	mode: 'history',
	scrollBehavior() {
		return { x: 0, y: 0 };
	},
	
	routes: [
		{ 
			path: '*', 
			component: recordList 
		}
	]
});

/* End Router */

/* Initialize */

new Vue({
	el: '#phaff-block',
	router
})

/* End Initialize */
