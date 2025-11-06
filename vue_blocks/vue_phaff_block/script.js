/* Main URLs */
// phaffDbUrl = "https://web.bftv.ucdavis.edu:8080/phaff/getrecord";
let phaffDbUrl = "https://web.bftv.ucdavis.edu/phaff/get-records.php";
// const blockID = document.getElementsByClassName('vue-phaff-block')[0]?.id;

/* Components */

// Vue 3: no Vue.extend — use a plain Options object or defineComponent.
const recordList = {
  template: '#record-list-template',

  data() {
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
      s_species_name_change: null,
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
    };
  },

  mounted() {
    this.emptyCart();
    this.getRecordsList(phaffDbUrl);
  },

  methods: {
    getRecordsList(url) {
      axios.get(url).then(response => {
        this.recordsData = response.data.dataList;
        this.filteredData = response.data.dataList;
        this.updateVisibleRecords();
        this.genus_set = [...new Set(this.recordsData.map(g => g.genus))].sort(Intl.Collator().compare);
        this.habitat_category_set = [...new Set(this.recordsData.map(g => g.source_habitat_category))].sort(Intl.Collator().compare);
        this.loading = false;
      });
    },

    updatePage(pageNumber) {
      this.currentPage = pageNumber;
      this.updateVisibleRecords();
    },

    updateVisibleRecords() {
      this.visibleRecords = this.filteredData.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
      if (this.visibleRecords.length === 0 && this.currentPage > 0) {
        this.updatePage(this.currentPage - 1);
      }
    },

    totalPages() {
      return Math.ceil((this.filteredData?.length || 0) / this.pageSize);
    },

    showPreviousLink() {
      return this.currentPage !== 0;
    },

    showNextLink() {
      return this.currentPage !== (this.totalPages() - 1);
    },

    search() {
      this.loading = true;

      if (this.s_strain_id) Object.assign(this.filters, { strain_id: this.s_strain_id });
      if (this.s_genus && this.s_genus !== " ") {
        Object.assign(this.filters, { genus: this.s_genus });
      } else if (this.s_genus === " ") {
        this.filters = this.deleteProps(this.filters, 'genus');
      }
      if (this.s_species) Object.assign(this.filters, { species: this.s_species });
      if (this.s_source_habitat_category && this.s_source_habitat_category !== "") {
        Object.assign(this.filters, { source_habitat_category: this.s_source_habitat_category });
      } else if (this.s_source_habitat_category === " ") {
        this.filters = this.deleteProps(this.filters, 'source_habitat_category');
      }
      if (this.s_source_habitat) Object.assign(this.filters, { source_habitat: this.s_source_habitat });
      if (this.s_cbs_number) Object.assign(this.filters, { cbs_number: this.s_cbs_number });
      if (this.s_atcc_number) Object.assign(this.filters, { atcc_number: this.s_atcc_number });
      if (this.s_nrrl_number) Object.assign(this.filters, { nrrl_number: this.s_nrrl_number });
      if (this.s_other_collection_numbers) Object.assign(this.filters, { other_collection_numbers: this.s_other_collection_numbers });
      if (this.s_synonym) Object.assign(this.filters, { synonym: this.s_synonym });
      if (this.s_geographic_origin) Object.assign(this.filters, { geographic_origin: this.s_geographic_origin });
      if (this.s_species_name_change) Object.assign(this.filters, { species_name_change: this.s_species_name_change });
      if (this.s_source_country) Object.assign(this.filters, { source_country: this.s_source_country });
      if (this.s_source_name) Object.assign(this.filters, { source_name: this.s_source_name });
      if (this.s_date_of_isolation) Object.assign(this.filters, { date_of_isolation: this.s_date_of_isolation });

      this.filteredData = this.multiFilter(this.recordsData, this.filters);
      this.updateVisibleRecords();
      this.loading = false;
    },

    deleteProps(obj, props) {
      if (!Array.isArray(props)) props = [props];
      return Object.keys(obj).reduce((newObj, prop) => {
        if (!props.includes(prop)) {
          newObj[prop] = obj[prop];
        }
        return newObj;
      }, {});
    },

    multiFilter(array, filters) {
      const filterKeys = Object.keys(filters);
      return array.filter((item) => {
        return filterKeys.every(key => {
          if (!filters[key].length) return true;
          return (item[key] || '').toString().toLowerCase().includes(filters[key].toLowerCase());
        });
      });
    },

    clearSearch() {
      this.s_strain_id = null;
      this.s_genus = null;
      this.s_species = null;
      this.s_source_habitat_category = null;
      this.s_source_habitat = null;
      this.s_cbs_number = null;
      this.s_atcc_number = null;
      this.s_nrrl_number = null;
      this.s_other_collection_numbers = null;
      this.s_synonym = null;
      this.s_geographic_origin = null;
      this.s_species_name_change = null;
      this.s_source_country = null;
      this.s_source_name = null;
      this.s_date_of_isolation = null;
      this.filters = {};
      this.filteredData = this.recordsData;
      this.updateVisibleRecords();
    },

    addToCart(id) {
      this.cart.push({ Genus: this.visibleRecords[id].genus, Species: this.visibleRecords[id].species, Dep: 'UCDFST', StrainID: this.visibleRecords[id].strain_id });
    },

    addToCartFull(id) {
      id = this.tempIndex;
      this.cart.push({ Genus: this.visibleRecords[id].genus, Species: this.visibleRecords[id].species, Dep: 'UCDFST', StrainID: this.visibleRecords[id].strain_id });
    },

    showCart() {
      this.viewMode = "cart";
    },

    showList() {
      this.viewMode = "list";
      if (this.scrollPosition !== 0) {
        window.scrollTo(0, this.scrollPosition);
      }
      this.singleItem = null;
    },

    removeItem(index) {
      this.cart.splice(index, 1);
    },

    showSingleItem(index) {
      this.scrollPosition = document.documentElement.scrollTop;
      this.viewMode = "single";
      window.scrollTo(0, 200);
      this.singleItem = this.visibleRecords[index];
      this.tempIndex = index;
    },

    checkOut() {
      document.cookie = "phaff=" + JSON.stringify(this.cart);
      let items = JSON.stringify(this.cart);
      items = items.split("},").join("%0A");
      items = items.split("}").join("%0A");
      items = items.split("{").join("");
      items = items.split("[").join("");
      items = items.split("]").join("");
      items = items.split("\"").join("");
      items = items.split(":").join(": ");
      items = items.split(",").join(", ");
      items = items.split("\\n").join("");
      window.location.href = '/form/checkout?checkout=true&items=' + btoa(items);
    },

    emptyCart() {
      this.cart = [];
      document.cookie = "phaff=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    },

    getCookie(name) {
      const value = "; " + document.cookie;
      const parts = value.split("; " + name + "=");
      if (parts.length === 2) return parts.pop().split(";").shift();
    },

    showMoreFields() {
      this.moreFields = true;
    },

    hideMoreFields() {
      this.moreFields = false;
    }
  },
};

/* Router (Vue Router 4) */
const router = VueRouter.createRouter({
  // If this doesn't work fallback, switch to:
  // history: VueRouter.createWebHashHistory(),
  history: VueRouter.createWebHistory(),
  scrollBehavior() {
    return { left: 0, top: 0 };
  },
  routes: [
    {
      path: '/:pathMatch(.*)*',
      component: recordList,
    },
  ],
});

/* Initialize */
const app = Vue.createApp({});
app.use(router);
app.mount('#phaff-block');
