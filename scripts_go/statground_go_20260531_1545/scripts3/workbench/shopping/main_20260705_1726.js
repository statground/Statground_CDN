(function () {
  const ECHARTS_URL = "/_statground/assets/npm/echarts/5.5.1/dist/echarts.min.js";
  const watchKey = "statground_shopping_watchlist_v1";
  const productViewKey = "statground_shopping_product_view_v1";
  const chartRegistry = {};
  const productDetailStore = {};
  let echartsPromise = null;
  let productDetailSeq = 0;

  function statgroundCDNBase() {
    const assetRoot = "scripts_go/statground_go_20260531_1545/";
    const scriptURL = typeof document !== "undefined" && document.currentScript && document.currentScript.src ? document.currentScript.src : "";
    const rootIndex = scriptURL.indexOf(assetRoot);
    if (rootIndex >= 0) return scriptURL.slice(0, rootIndex);
    return "/";
  }

  const STATGROUND_CDN = statgroundCDNBase();
  const ADPICK_LOGO_URL = STATGROUND_CDN + "images/common/affiliates/adpick.png";
  const providerLogos = {
    gmarket: STATGROUND_CDN + "images/workbench/shopping/gmarket_logo_20260629_1333.svg",
    kurly: STATGROUND_CDN + "images/workbench/shopping/kurly_logo_20260629_1333.svg"
  };
  const STANDARD_CATEGORIES = ["식품", "생활/주방", "뷰티/헬스", "패션/잡화", "디지털/가전", "가구/홈", "스포츠/레저", "유아/반려", "도서/취미/문구", "여행/e쿠폰"];
  const CATEGORY_ALIASES = {
    "신선식품": "식품",
    "가공식품": "식품",
    "식품-신선": "식품",
    "식품-가공": "식품",
    "간식": "식품",
    "간식빵": "식품",
    "선식-시리얼": "식품",
    "식용유-참기름-오일": "식품",
    "브로콜리-파프리카-양배추": "식품",
    "소시지-베이컨-하몽": "식품",
    "달걀-가공란": "식품",
    "달걀": "식품",
    "명란": "식품",
    "디저트": "식품",
    "오징어-낙지-문어": "식품",
    "국": "식품",
    "치즈": "식품",
    "코코아-밀크티-기타-차": "식품",
    "수입산-돼지고기-양고기": "식품",
    "신선하게-받아보는": "식품",
    "닭고기": "식품",
    "닭가슴살": "식품",
    "닭-오리고기": "식품",
    "밀가루-가루-믹스": "식품",
    "김-미역-해조류": "식품",
    "치킨-피자-핫도그-만두": "식품",
    "잡곡": "식품",
    "멸치-황태-다시팩": "식품",
    "떡볶이": "식품",
    "떡-한과": "식품",
    "초콜릿-젤리-캔디": "식품",
    "증류주-약주-청주": "식품",
    "콩나물-버섯": "식품",
    "두부-어묵-부침개": "식품",
    "아이스크림": "식품",
    "이유식-재료": "식품",
    "분유-간편-이유식": "식품",
    "짜장-짬뽕-파스타-면류": "식품",
    "피자": "식품",
    "친환경": "식품",
    "6월신상품": "식품",
    "생활": "생활/주방",
    "주방": "생활/주방",
    "생필품": "생활/주방",
    "생필품-육아": "생활/주방",
    "수건": "생활/주방",
    "스크럽-대디": "생활/주방",
    "뷰티": "뷰티/헬스",
    "화장품": "뷰티/헬스",
    "립메이크업": "뷰티/헬스",
    "건강": "뷰티/헬스",
    "헬스": "뷰티/헬스",
    "여성-위생용품": "뷰티/헬스",
    "구강-면도": "뷰티/헬스",
    "패션": "패션/잡화",
    "패션-의류": "패션/잡화",
    "잡화": "패션/잡화",
    "가방": "패션/잡화",
    "신발": "패션/잡화",
    "운동화": "패션/잡화",
    "디지털": "디지털/가전",
    "가전": "디지털/가전",
    "컴퓨터": "디지털/가전",
    "보조배터리": "디지털/가전",
    "키보드": "디지털/가전",
    "선풍기": "디지털/가전",
    "가구": "가구/홈",
    "홈": "가구/홈",
    "홈패브릭": "가구/홈",
    "책상": "가구/홈",
    "테이블-식탁-책상": "가구/홈",
    "스포츠": "스포츠/레저",
    "스포츠-건강": "스포츠/레저",
    "수영": "스포츠/레저",
    "유아": "유아/반려",
    "육아": "유아/반려",
    "반려": "유아/반려",
    "펫": "유아/반려",
    "강아지-주식": "유아/반려",
    "장난감": "유아/반려",
    "도서": "도서/취미/문구",
    "도서-음반": "도서/취미/문구",
    "취미-문구-펫": "도서/취미/문구",
    "문구": "도서/취미/문구",
    "취미": "도서/취미/문구",
    "여행": "여행/e쿠폰",
    "e쿠폰": "여행/e쿠폰",
    "이쿠폰": "여행/e쿠폰",
    "쿠폰": "여행/e쿠폰"
  };
  const DEFAULT_PRICE_RANGE_BOUNDARIES = [0, 5000, 10000, 30000, 50000, 100000];
  const KEYWORD_EXCLUSION_TERMS = ["마켓컬리", "골라담기"];

  const dict = {
    ko: {
      back: "워크벤치",
      title: "Shopping Price Insight",
      desc: "Gmarket과 Kurly에서 관측한 카테고리, 키워드, 가격 범위, 기회 신호를 원본 재게시 없이 집계·파생 지표로 분석합니다.",
      notice: "이 화면은 상품 상세를 복제하지 않고 플랫폼별 관측 상품과 카테고리·키워드·가격 범위의 집계 지표를 보여줍니다. 표시 가격과 반응 지표는 측정 시각의 관측값이며 실제 구매·판매 판단 전에는 외부몰의 현재 조건을 확인해야 합니다.",
      budget: "예산",
      category: "카테고리",
      query: "찾는 것",
      queryPlaceholder: "예: 가구, 화장품, 상품코드",
      intent: "분석 목적",
      intent_budget: "저가 탐색",
      intent_gift: "선물 탐색",
      intent_daily: "생활템 탐색",
      intent_seller: "셀러 분석",
      allCategories: "전체",
      analyze: "분석하기",
      finding: "분석 중...",
      loadError: "쇼핑 인사이트를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      finderError: "조건에 맞는 분석 결과를 만들지 못했습니다. 조건을 바꿔 다시 시도해 주세요.",
      overview: "시장 요약",
      chartPrice: "가격 범위 분포",
      chartCategory: "카테고리 수요·경쟁",
      chartKeywordCategory: "주요 상품 키워드 수요·경쟁",
      chartCandidates: "가격 포지셔닝 분포",
      chartKeywordCandidates: "주요 상품 키워드 가격 포지셔닝",
      chartSeller: "카테고리 기회 점수",
      chartKeywordSeller: "주요 상품 키워드 기회 점수",
      marketMap: "카테고리 시장지도",
      keywordDiscovery: "키워드 발굴",
      crossAnalysis: "카테고리 × 키워드 분석",
      keywordAnalysis: "주요 상품 키워드 분석",
      pricePositioning: "가격 포지셔닝",
      keywordPricePositioning: "주요 상품 키워드 가격 포지셔닝",
      metricOpportunity: "기회점수",
      metricCompetition: "경쟁강도",
      metricDemand: "수요대리",
      metricSaturation: "포화도",
      metricGap: "가격공백",
      p25: "P25",
      p50: "P50",
      p75: "P75",
      iqr: "IQR",
      reviews: "리뷰합",
      orders: "주문합",
      sellers: "셀러 수",
      brands: "브랜드 수",
      reactionShare: "반응 비중",
      productShare: "상품 비중",
      interpretation: "해석",
      allMarket: "전체 시장",
      selectCategoryInsight: "카테고리를 선택하면 아래 교차분석이 해당 범위로 좁혀집니다.",
      affiliateDisclosure: "이 화면은 상품 상세 재게시가 아니라 측정 시각 기준 집계·파생 지표를 제공합니다.",
      candidates: "가격 후보",
      actions: "다음 행동",
      seller: "셀러 기회",
      watchlist: "가격 알림 후보",
      policies: "안전 경계",
      products: "관측 상품",
      categoriesLabel: "카테고리",
      standardCategoriesLabel: "표준 카테고리",
      standardCategoriesSub: "선택 범위에 걸린 공통 분류 축",
      discounted: "할인 신호",
      lowPrice: "1만원 이하",
      latest: "최근 측정",
      median: "중앙값",
      price: "관측가",
      priceBasisLabel: "가격 기준",
      basis: "배송/옵션 미포함",
      originalPrice: "표시 정가",
      categoryMedian: "카테고리 중앙값",
      confidence: "딜 신뢰도",
      reason: "분석 사유",
      collected: "측정 시각",
      source: "판매처에서 현재가 확인",
      productViewMode: "상품 표시",
      compactView: "작게 보기",
      largeView: "크게 보기",
      productDetails: "상품 상세",
      openProductDetails: "자세히",
      closeDetails: "닫기",
      saveWatch: "알림 후보 저장",
      savedWatch: "저장됨",
      removeWatch: "삭제",
      routerNotice: "",
      noCandidates: "현재 조건에서 표시할 후보가 없습니다.",
      noSeller: "셀러 기회 신호가 아직 없습니다.",
      noWatchlist: "저장된 가격 알림 후보가 없습니다.",
      pressure_high_price_pressure: "가격 압박 높음",
      pressure_promotion_sensitive: "프로모션 민감",
      pressure_thin_sample: "표본 부족",
      pressure_watch: "관찰",
      status_active: "적용",
      status_partial: "부분 적용",
      chartPreparing: "차트 데이터를 확인하고 있습니다.",
      chartEmpty: "이 렌즈의 차트용 집계 데이터가 아직 부족합니다.",
      chartEmptyHint: "상품 수가 충분해도 선택한 범위의 가격·카테고리·키워드 집계가 없으면 차트를 그릴 수 없습니다.",
      chartRenderError: "차트를 그리지 못했습니다. 잠시 후 다시 시도해 주세요.",
      demand: "수요/표본",
      discount: "할인율",
      lowPriceShare: "저가 비중",
      opportunity: "기회 점수",
      kpiCoverage: "가격 이력",
      kpiCoverageSub: "재관측 상품",
      kpiPriceRange: "가격 범위",
      kpiPriceRangeSub: "최저가 - 최고가",
      kpiPolicy: "공개 데이터",
      kpiPolicySub: "파생 지표 중심",
      sellerFirst: "셀러 분석 모드에서는 카테고리 압력과 기회 점수를 먼저 봅니다.",
      chooseCategory: "카테고리 선택",
      categoryDeckDesc: "카테고리를 선택하면 해당 범위의 가격 범위, 키워드, 기회 점수, 관측 상품만 집중해서 보여줍니다.",
      categoryIconOnlyHint: "",
      viewCategory: "분석 보기",
      selectedCategory: "선택 카테고리",
      loadingCategory: "카테고리 상품을 불러오는 중...",
      categoryProducts: "카테고리 분석 후보",
      categoryHint: "카테고리를 선택하면 교차분석이 좁혀집니다.",
      categoryAllCharts: "전체 카테고리 기준 차트",
      categoryEmpty: "표시할 카테고리 분석 후보가 없습니다.",
      categoryObservedProducts: "카테고리 관측 상품",
      platform: "플랫폼",
      topCategories: "카테고리 보기",
      categoryFirstTitle: "먼저 카테고리 선택",
      categoryFirstDesc: "표준 10개 카테고리에서 분석 렌즈를 고른 뒤 시장, 가격 범위, 키워드, 상품 근거로 내려갑니다.",
      keywordSearchPlaceholder: "키워드 검색",
      keywordSearchButton: "검색",
      keywordSearchLoading: "검색 중",
      keywordSearchLoadingTitle: "검색 결과를 분석하는 중입니다.",
      keywordSearchLoadingDetail: "DB mart에서 관련 키워드와 상품 근거를 찾고, 현재 가격 범위 기준으로 시장 기준선부터 다시 계산하고 있습니다.",
      priceEvidenceLoadingTitle: "선택 범위의 상품 근거를 불러오는 중입니다.",
      priceEvidenceLoadingDetail: "DB current 상품에서 가격 범위와 카테고리에 맞는 관측 상품을 찾고 있습니다.",
      keywordSearchNoResult: "검색 결과 없음",
      keywordSearchSummaryInterpretation: "검색어와 맞는 상품 후보를 기준으로 임시로 묶은 결과입니다.",
      filterAll: "전체",
      filterOpportunity: "기회 높은 항목",
      filterCrossCategory: "여러 카테고리",
      submitCategory: "카테고리 선택",
      submitKeyword: "키워드 선택",
      priceBandStageTitle: "가격 범위",
      priceBandStageDesc: "범위를 고르면 아래 시장 요약, 차트, 키워드, 교차분석, 상품 목록이 그 가격 범위 안의 관측값만 기준으로 다시 바뀝니다.",
      absolutePriceBands: "가격 범위",
      relativePriceBands: "직접 입력",
      priceBandScope: "적용 렌즈",
      priceBandUse: "선택한 범위 안의 데이터만 아래 분석과 상품 목록에 반영됩니다.",
      priceBandSelected: "선택 범위",
      priceBandUnselected: "전체 가격 범위",
      selectPriceBand: "가격 범위 선택",
      priceRangeAll: "전체 가격",
      priceRangeCustom: "직접 범위 입력",
      priceRangeMin: "최소가",
      priceRangeMax: "최대가",
      priceRangeApply: "적용",
      priceRangeClear: "전체로 보기",
      priceRangeCustomInvalid: "최소가와 최대가를 다시 확인해 주세요.",
      priceRangeDragHint: "주요 가격대는 더 촘촘하게, 끝점은 실제 최저가~최고가를 유지합니다.",
      priceRangeDistribution: "주요 가격대 분포",
      priceRangeQuick: "빠른 범위",
      priceRangeManual: "숫자로 미세 조정",
      relativeLow: "저가권",
      relativeCenterLow: "하위 중앙권",
      relativeCenterHigh: "상위 중앙권",
      relativePremium: "프리미엄권",
      allView: "전체",
      currentView: "현재 보기",
      compareView: "비교 보기",
      compareCategories: "카테고리 비교",
      selectedCount: "선택",
      compareLoading: "비교 데이터를 불러오는 중...",
      compareEmpty: "비교할 카테고리를 2개 이상 선택해 주세요.",
      compareSummary: "선택 카테고리 요약",
      compareProducts: "비교 카테고리 관측 상품",
      compareKeywords: "주요 키워드",
      compareScoreChart: "카테고리 수요·경쟁·기회 비교",
      comparePriceChart: "카테고리 가격 범위 비교",
      compareShareChart: "저가·할인 신호 비교",
      totalProducts: "총 관측 상품",
      medianOfMedians: "중앙값 범위",
      clearSelection: "선택 해제",
      analysisMode: "분석 모드",
      categoryMode: "카테고리 기준",
      keywordMode: "키워드 기준",
      keywordView: "키워드 보기",
      keywordViews: "키워드 보기",
      keywordSelection: "키워드 선택",
      compareKeywordTitle: "키워드 비교",
      keywordScoreChart: "키워드 수요·경쟁·기회 비교",
      keywordPriceChart: "키워드 가격 분위수 비교",
      keywordCoverageChart: "키워드 상품·카테고리 분포",
      keywordSummary: "키워드 요약",
      keywordProducts: "키워드 관측 상품",
      selectedKeywords: "선택 키워드",
      categoryCoverage: "포함 카테고리",
      categoryKeywordLens: "카테고리 안의 키워드",
      categoryKeywordScoreChart: "선택 카테고리 키워드 수요·경쟁·기회",
      categoryKeywordPriceChart: "선택 카테고리 키워드 가격 분위수",
      keywordCategoryLens: "키워드 안의 카테고리",
      keywordCategoryScoreChart: "선택 키워드 카테고리 수요·경쟁·기회",
      keywordCategoryPriceChart: "선택 키워드 카테고리 가격 분위수",
      prevPage: "이전",
      nextPage: "다음",
      chartRailHint: "",
      analysisPath: "",
      pathMarket: "시장 기준선",
      pathCategory: "카테고리 축",
      pathPrice: "가격 범위",
      pathKeyword: "키워드 축",
      pathSegment: "교차 지점",
      pathEvidence: "상품 근거",
      marketStageTitle: "시장 기준선",
      marketStageDesc: "관측 상품 규모, 할인·저가 신호와 차트로 선택 렌즈를 전체 시장 기준선에 놓고 봅니다.",
      categoryStageTitle: "카테고리",
      categoryStageDesc: "",
      keywordStageTitle: "키워드",
      keywordStageDesc: "키워드는 여러 카테고리에 동시에 걸칠 수 있습니다. 카드에서 키워드를 선택하면 키워드 기준 화면에서 반대쪽 카테고리 분포를 다시 확인할 수 있습니다.",
      keywordPickHint: "키워드 카드를 눌러 선택",
      segmentStageTitle: "카테고리 × 키워드",
      segmentStageDesc: "선택한 축이 만나는 지점에서 가격 분위수, 수요대리, 경쟁강도, 가격공백, 기회점수를 비교합니다.",
      evidenceStageTitle: "상품 근거",
      evidenceStageDesc: "마지막에만 관측 상품 후보와 외부 링크 경계를 확인합니다. 상품 상세 복제가 아니라 집계 신호의 근거입니다.",
      openKeywordView: "키워드 기준으로 보기",
      openCategoryView: "카테고리 기준으로 보기",
      crossCategorySignal: "여러 카테고리에 걸침",
      selectedLens: "선택 렌즈",
      categoryAxis: "카테고리 축",
      keywordAxis: "키워드 축",
      noSelectedLens: "전체 시장",
      axisProducts: "관측 상품",
      axisMedian: "P50",
      axisCategories: "연결 카테고리"
    },
    en: {
      back: "Workbench",
      title: "Shopping Price Insight",
      desc: "Analyze category, keyword, price range, and opportunity signals observed from Gmarket and Kurly without republishing marketplace content.",
      notice: "This view does not replicate product detail pages. It shows provider-aware observed products plus aggregate metrics by category, keyword, and price range. Prices and reaction signals are observations at measurement time; verify the current external mall conditions before buying or selling decisions.",
      budget: "Budget",
      category: "Category",
      query: "Need",
      queryPlaceholder: "e.g. furniture, beauty, product code",
      intent: "Analysis goal",
      intent_budget: "Budget hunt",
      intent_gift: "Gift hunt",
      intent_daily: "Daily item",
      intent_seller: "Seller analysis",
      allCategories: "All",
      analyze: "Analyze",
      finding: "Analyzing...",
      loadError: "Failed to load shopping insight. Please try again.",
      finderError: "Could not build insight for the current filters. Try different filters.",
      overview: "Market summary",
      chartPrice: "Price range distribution",
      chartCategory: "Category demand and competition",
      chartKeywordCategory: "Major product keyword demand and competition",
      chartCandidates: "Price positioning distribution",
      chartKeywordCandidates: "Major product keyword price positioning",
      chartSeller: "Category opportunity score",
      chartKeywordSeller: "Major product keyword opportunity score",
      marketMap: "Category market map",
      keywordDiscovery: "Keyword discovery",
      crossAnalysis: "Category × keyword analysis",
      keywordAnalysis: "Major product keyword analysis",
      pricePositioning: "Price positioning",
      keywordPricePositioning: "Major product keyword price positioning",
      metricOpportunity: "Opportunity",
      metricCompetition: "Competition",
      metricDemand: "Demand proxy",
      metricSaturation: "Saturation",
      metricGap: "Price gap",
      p25: "P25",
      p50: "P50",
      p75: "P75",
      iqr: "IQR",
      reviews: "Reviews",
      orders: "Orders",
      sellers: "Sellers",
      brands: "Brands",
      reactionShare: "Reaction share",
      productShare: "Product share",
      interpretation: "Interpretation",
      allMarket: "All market",
      selectCategoryInsight: "Select a category to narrow the cross-analysis below.",
      affiliateDisclosure: "This view provides aggregate and derived signals at measurement time, not republished product detail content.",
      candidates: "Price candidates",
      actions: "Next actions",
      seller: "Seller opportunities",
      watchlist: "Price alert candidates",
      policies: "Safety boundary",
      products: "Observed products",
      categoriesLabel: "Categories",
      standardCategoriesLabel: "Standard categories",
      standardCategoriesSub: "Common category axes in this range",
      discounted: "Discount signals",
      lowPrice: "Under ₩10,000",
      latest: "Latest measurement",
      median: "Median",
      price: "Observed price",
      priceBasisLabel: "Price basis",
      basis: "Excludes shipping/options",
      originalPrice: "Listed original",
      categoryMedian: "Category median",
      confidence: "Deal confidence",
      reason: "Signal",
      collected: "Measured",
      source: "Check current external price",
      productViewMode: "Product view",
      compactView: "Compact",
      largeView: "Large",
      productDetails: "Product detail",
      openProductDetails: "Details",
      closeDetails: "Close",
      saveWatch: "Save alert candidate",
      savedWatch: "Saved",
      removeWatch: "Remove",
      routerNotice: "",
      noCandidates: "No displayable candidates for the current filters.",
      noSeller: "No seller opportunity signal yet.",
      noWatchlist: "No saved price alert candidates.",
      pressure_high_price_pressure: "High price pressure",
      pressure_promotion_sensitive: "Promotion-sensitive",
      pressure_thin_sample: "Thin sample",
      pressure_watch: "Watch",
      status_active: "Active",
      status_partial: "Partial",
      chartPreparing: "Checking chart data.",
      chartEmpty: "This lens does not have enough chart-ready aggregate data yet.",
      chartEmptyHint: "Even with many products, a chart needs price, category, or keyword aggregates for the selected range.",
      chartRenderError: "Unable to draw this chart. Please try again shortly.",
      demand: "Demand/sample",
      discount: "Discount",
      lowPriceShare: "Low-price share",
      opportunity: "Opportunity",
      kpiCoverage: "Price history",
      kpiCoverageSub: "Repeated observations",
      kpiPriceRange: "Price range",
      kpiPriceRangeSub: "Lowest - highest",
      kpiPolicy: "Public data",
      kpiPolicySub: "Derived metrics only",
      sellerFirst: "Seller analysis mode prioritizes category pressure and opportunity scores.",
      chooseCategory: "Choose a category",
      categoryDeckDesc: "Select a category to focus price ranges, keywords, opportunity scores, and observed products within that category.",
      categoryIconOnlyHint: "",
      viewCategory: "View analysis",
      selectedCategory: "Selected category",
      loadingCategory: "Loading category products...",
      categoryProducts: "Category analysis candidates",
      categoryHint: "Select a category to narrow the cross-analysis.",
      categoryAllCharts: "Charts across all categories",
      categoryEmpty: "No displayable analysis candidates for this category.",
      categoryObservedProducts: "Observed category products",
      platform: "Platform",
      topCategories: "Category views",
      categoryFirstTitle: "Choose a category first",
      categoryFirstDesc: "Start from the 10 standard category lenses, then move down into market, price ranges, keywords, and evidence.",
      keywordSearchPlaceholder: "Search keywords",
      keywordSearchButton: "Search",
      keywordSearchLoading: "Searching",
      keywordSearchLoadingTitle: "Analyzing search results.",
      keywordSearchLoadingDetail: "Finding related keywords and product evidence from the DB mart, then recalculating the market baseline for the current price range.",
      priceEvidenceLoadingTitle: "Loading product evidence for the selected range.",
      priceEvidenceLoadingDetail: "Fetching observed products from the DB current tables for the selected price range and category.",
      keywordSearchNoResult: "No results",
      keywordSearchSummaryInterpretation: "Grouped from product candidates that match the search term.",
      filterAll: "All",
      filterOpportunity: "High opportunity",
      filterCrossCategory: "Cross-category",
      submitCategory: "Select category",
      submitKeyword: "Select keyword",
      priceBandStageTitle: "Price Range",
      priceBandStageDesc: "Choose a range and every market summary, chart, keyword, cross-analysis, and product list below will update to that observed price range.",
      absolutePriceBands: "Price ranges",
      relativePriceBands: "Custom range",
      priceBandScope: "Applied lens",
      priceBandUse: "Only observations inside the selected range feed the analysis and product lists below.",
      priceBandSelected: "Selected range",
      priceBandUnselected: "All prices",
      selectPriceBand: "Select price range",
      priceRangeAll: "All prices",
      priceRangeCustom: "Custom range",
      priceRangeMin: "Min price",
      priceRangeMax: "Max price",
      priceRangeApply: "Apply",
      priceRangeClear: "Show all",
      priceRangeCustomInvalid: "Check the minimum and maximum prices.",
      priceRangeDragHint: "Major price zones get finer control while endpoints keep the observed min and max.",
      priceRangeDistribution: "Main price distribution",
      priceRangeQuick: "Quick ranges",
      priceRangeManual: "Fine-tune with numbers",
      relativeLow: "Low band",
      relativeCenterLow: "Lower-middle band",
      relativeCenterHigh: "Upper-middle band",
      relativePremium: "Premium band",
      allView: "All",
      currentView: "Current view",
      compareView: "Comparison view",
      compareCategories: "Compare categories",
      selectedCount: "Selected",
      compareLoading: "Loading comparison data...",
      compareEmpty: "Select two or more categories to compare.",
      compareSummary: "Selected category summary",
      compareProducts: "Observed products in compared categories",
      compareKeywords: "Top keywords",
      compareScoreChart: "Category demand, competition, and opportunity",
      comparePriceChart: "Category price comparison",
      compareShareChart: "Low-price and discount signal comparison",
      totalProducts: "Total observed products",
      medianOfMedians: "Median price range",
      clearSelection: "Clear selection",
      analysisMode: "Analysis mode",
      categoryMode: "By category",
      keywordMode: "By keyword",
      keywordView: "Keyword view",
      keywordViews: "Keyword views",
      keywordSelection: "Keyword selection",
      compareKeywordTitle: "Keyword comparison",
      keywordScoreChart: "Keyword demand, competition, and opportunity",
      keywordPriceChart: "Keyword price percentile comparison",
      keywordCoverageChart: "Keyword product and category coverage",
      keywordSummary: "Keyword summary",
      keywordProducts: "Observed products by keyword",
      selectedKeywords: "Selected keywords",
      categoryCoverage: "Category coverage",
      categoryKeywordLens: "Keywords inside the category",
      categoryKeywordScoreChart: "Selected category keyword demand, competition, and opportunity",
      categoryKeywordPriceChart: "Selected category keyword price percentiles",
      keywordCategoryLens: "Categories inside the keyword",
      keywordCategoryScoreChart: "Selected keyword category demand, competition, and opportunity",
      keywordCategoryPriceChart: "Selected keyword category price percentiles",
      prevPage: "Previous",
      nextPage: "Next",
      chartRailHint: "",
      analysisPath: "",
      pathMarket: "Market baseline",
      pathCategory: "Category axis",
      pathPrice: "Price criteria",
      pathKeyword: "Keyword axis",
      pathSegment: "Cross point",
      pathEvidence: "Product evidence",
      marketStageTitle: "Market Baseline",
      marketStageDesc: "Use observed volume, discount and low-price signals, and charts to place the selected lens against the whole market.",
      categoryStageTitle: "Category",
      categoryStageDesc: "",
      keywordStageTitle: "Keyword",
      keywordStageDesc: "A keyword can belong to multiple categories. Select a keyword card to open the keyword view and compare the reverse category distribution.",
      keywordPickHint: "Select a keyword card",
      segmentStageTitle: "Category × Keyword",
      segmentStageDesc: "At the intersection, compare price percentiles, demand proxy, competition, price gap, and opportunity.",
      evidenceStageTitle: "Product Evidence",
      evidenceStageDesc: "Observed product candidates and outbound-link boundaries appear last as evidence for the aggregate signals.",
      openKeywordView: "Open keyword view",
      openCategoryView: "Open category view",
      crossCategorySignal: "Spans categories",
      selectedLens: "Selected lens",
      categoryAxis: "Category axis",
      keywordAxis: "Keyword axis",
      noSelectedLens: "Whole market",
      axisProducts: "Observed products",
      axisMedian: "P50",
      axisCategories: "Linked categories"
    }
  };

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function displayLang(lang) {
    const raw = String(lang || "").trim();
    const lower = raw.toLowerCase();
    if (!raw) return "ko";
    if (lower === "zh" || lower.startsWith("zh-")) return lower.includes("tw") || lower.includes("hk") || lower.includes("mo") || lower.includes("hant") ? "zh-Hant" : "zh-Hans";
    if (lower === "pt" || lower.startsWith("pt-")) return "pt-BR";
    if (lower === "tl" || lower.startsWith("tl-") || lower === "fil" || lower.startsWith("fil-")) return "fil";
    const supported = ["ko", "en", "ja", "zh-Hans", "zh-Hant", "es", "fr", "de", "pt-BR", "ru", "id", "vi", "th", "ms", "fil", "hi", "ar", "it", "nl", "pl", "sv", "tr", "uk"];
    return supported.find((code) => lower === code.toLowerCase() || lower.startsWith(code.toLowerCase() + "-")) || "ko";
  }

  function routeLang() {
    const seg = (location.pathname || "").split("/").filter(Boolean);
    if (seg.length > 0 && seg[0] !== "workbench" && seg[0] !== "shopping") return displayLang(seg[0]);
    if (window.sg_get_current_lang) return displayLang(window.sg_get_current_lang());
    return displayLang(document.documentElement.getAttribute("lang") || "ko");
  }

  function eventLang(event) {
    const raw = event && event.detail && event.detail.lang ? String(event.detail.lang).trim() : "";
    return raw ? displayLang(raw) : "";
  }

  function syncLangToURL(lang) {
    const langCode = displayLang(lang);
    const parts = (location.pathname || "/").split("/").filter(Boolean);
    const shoppingIndex = parts.indexOf("shopping");
    if (!langCode || shoppingIndex < 0) return false;
    if (shoppingIndex === 0) parts.unshift(langCode);
    else parts[0] = langCode;
    const next = "/" + parts.join("/") + "/" + (location.search || "") + (location.hash || "");
    const current = (location.pathname || "/") + (location.search || "") + (location.hash || "");
    if (next !== current) {
      location.href = next;
      return true;
    }
    return false;
  }

  function t(lang, key) {
    const d = dict[displayLang(lang)] || dict[String(lang || "").slice(0, 2)] || dict.en;
    return d[key] || dict.en[key] || dict.ko[key] || key;
  }

  function tOptional(lang, key) {
    const d = dict[displayLang(lang)] || dict[String(lang || "").slice(0, 2)] || dict.en;
    if (d && Object.prototype.hasOwnProperty.call(d, key)) return d[key] || "";
    if (Object.prototype.hasOwnProperty.call(dict.en, key)) return dict.en[key] || "";
    if (Object.prototype.hasOwnProperty.call(dict.ko, key)) return dict.ko[key] || "";
    return "";
  }

  function number(value) {
    const n = Number(value || 0);
    if (!Number.isFinite(n)) return "";
    try { return new Intl.NumberFormat().format(Math.round(n)); } catch (_) { return String(Math.round(n)); }
  }

  function pct(value) {
    const n = Number(value || 0);
    if (!Number.isFinite(n) || n <= 0) return "0%";
    return (Math.round(n * 10) / 10).toString() + "%";
  }

  function krw(value) {
    const v = number(value);
    return v ? "₩" + v : "-";
  }

  function apiURL(lang, kind, params) {
    const base = shoppingBasePath(lang) + kind + "/";
    const query = new URLSearchParams(params || {});
    return base + (query.toString() ? "?" + query.toString() : "");
  }

  function shoppingBasePath(lang) {
    return "/" + encodeURIComponent(displayLang(lang)) + "/shopping/";
  }

  function shoppingPathParts() {
    try {
      return window.location.pathname.split("/").filter(Boolean).map((part) => {
        try { return decodeURIComponent(part); } catch (_) { return part; }
      });
    } catch (_) {
      return [];
    }
  }

  function shoppingSegmentIndex(parts) {
    const rows = parts || shoppingPathParts();
    return rows.indexOf("shopping");
  }

  function categorySlug(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[\/\\\s]+/g, "-")
      .replace(/[^0-9a-z가-힣_-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function standardCategoryName(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    const slug = categorySlug(text);
    const direct = STANDARD_CATEGORIES.find((name) => categorySlug(name) === slug);
    if (direct) return direct;
    if (CATEGORY_ALIASES[slug]) return CATEGORY_ALIASES[slug];
    const lower = text.toLowerCase();
    if (lower.includes("식품") || lower.includes("간식") || lower.includes("고기") || lower.includes("닭") || lower.includes("돼지") || lower.includes("소고") || lower.includes("수산") || lower.includes("해조") || lower.includes("면류") || lower.includes("떡") || lower.includes("빵") || lower.includes("치즈") || lower.includes("우유") || lower.includes("분유") || lower.includes("이유식") || lower.includes("아이스크림") || lower.includes("초콜릿") || lower.includes("피자") || lower.includes("만두") || lower.includes("시리얼") || lower.includes("친환경")) return "식품";
    if (lower.includes("생활") || lower.includes("주방") || lower.includes("수건") || lower.includes("세제") || lower.includes("휴지") || lower.includes("스크럽")) return "생활/주방";
    if (lower.includes("뷰티") || lower.includes("헬스") || lower.includes("화장") || lower.includes("위생") || lower.includes("구강") || lower.includes("면도")) return "뷰티/헬스";
    if (lower.includes("패션") || lower.includes("잡화") || lower.includes("의류") || lower.includes("신발") || lower.includes("운동화") || lower.includes("가방")) return "패션/잡화";
    if (lower.includes("디지털") || lower.includes("가전") || lower.includes("컴퓨터") || lower.includes("선풍기") || lower.includes("키보드")) return "디지털/가전";
    if (lower.includes("가구") || lower.includes("홈") || lower.includes("침구") || lower.includes("테이블") || lower.includes("책상")) return "가구/홈";
    if (lower.includes("스포츠") || lower.includes("레저") || lower.includes("수영")) return "스포츠/레저";
    if (lower.includes("유아") || lower.includes("육아") || lower.includes("반려") || lower.includes("펫") || lower.includes("강아지") || lower.includes("고양이")) return "유아/반려";
    if (lower.includes("도서") || lower.includes("취미") || lower.includes("문구") || lower.includes("음반")) return "도서/취미/문구";
    if (lower.includes("여행") || lower.includes("쿠폰") || lower.includes("e쿠폰")) return "여행/e쿠폰";
    return "";
  }

  function normalizedCategorySlug(value) {
    return categorySlug(standardCategoryName(value) || value);
  }

  function categoryHref(lang, value) {
    const slug = normalizedCategorySlug(value);
    return shoppingBasePath(lang) + (slug ? "category/" + encodeURIComponent(slug) + "/" : "");
  }

  function keywordBasePath(lang) {
    return shoppingBasePath(lang) + "keyword/";
  }

  function shoppingSelectPath(lang) {
    return shoppingBasePath(lang) + "select/";
  }

  function postSelectionForm(lang, axis, value, html, classes, attrs) {
    return [
      '<form method="post" action="' + esc(shoppingSelectPath(lang)) + '" class="' + esc(classes || "contents") + '"' + (attrs ? " " + attrs : "") + '>',
      '<input type="hidden" name="axis" value="' + esc(axis || "clear") + '">',
      value ? '<input type="hidden" name="' + esc(axis || "value") + '" value="' + esc(value) + '">' : '',
      html,
      '</form>'
    ].join("");
  }

  function uniqueSlugs(values) {
    const seen = {};
    const rows = [];
    (values || []).forEach((value) => {
      const slug = categorySlug(value);
      if (!slug || seen[slug]) return;
      seen[slug] = true;
      rows.push(slug);
    });
    return rows;
  }

  function uniqueCategorySlugs(values) {
    const seen = {};
    const rows = [];
    (values || []).forEach((value) => {
      const slug = normalizedCategorySlug(value);
      if (!slug || seen[slug]) return;
      seen[slug] = true;
      rows.push(slug);
    });
    return rows;
  }

  function compareHref(lang, slugs) {
    const rows = uniqueCategorySlugs(slugs).slice(0, 6);
    if (!rows.length) return shoppingBasePath(lang);
    if (rows.length === 1) return categoryHref(lang, rows[0]);
    return shoppingBasePath(lang) + "?compare=" + rows.map((slug) => encodeURIComponent(slug)).join(",");
  }

  function compareSlugsFromURL() {
    try {
      const params = new URLSearchParams(window.location.search || "");
      const raw = params.get("compare") || params.get("categories") || "";
      return uniqueCategorySlugs(String(raw || "").split(",")).slice(0, 6);
    } catch (_) {
      return [];
    }
  }

  function analysisModeFromURL() {
    try {
      const params = new URLSearchParams(window.location.search || "");
      const raw = String(params.get("mode") || params.get("analysis") || "").trim().toLowerCase();
      return raw === "keyword" || raw === "keywords" ? "keyword" : "category";
    } catch (_) {
      return "category";
    }
  }

  function keywordKey(value) {
    return categorySlug(value);
  }

  const KEYWORD_TOKEN_STOPWORDS = {
    and: true,
    or: true,
    the: true,
    for: true,
    with: true,
    of: true,
    by: true,
    x: true
  };

  function keywordTokens(value) {
    return keywordKey(keywordPathDisplay(value || ""))
      .split(/[-_]+/)
      .map((token) => String(token || "").trim())
      .filter((token) => {
        if (!token || KEYWORD_TOKEN_STOPWORDS[token]) return false;
        return /[가-힣]/.test(token) ? token.length >= 1 : token.length >= 2;
      });
  }

  function keywordSearchTextMatches(text, query) {
    const q = keywordKey(query);
    const haystack = keywordKey(text);
    if (!q || !haystack) return false;
    if (haystack === q || haystack.indexOf(q) >= 0 || q.indexOf(haystack) >= 0) return true;
    const tokens = keywordTokens(query);
    return tokens.length > 1 && tokens.every((token) => haystack.indexOf(token) >= 0);
  }

  function keywordRowSearchText(row) {
    return [
      row && row.keyword,
      row && row.source_category,
      row && row.cluster_label,
      row && row.interpretation
    ].filter(Boolean).join(" ");
  }

  function productSearchText(item) {
    return [
      productLabel(item),
      item && item.keyword,
      item && item.product_name,
      item && item.product_label,
      item && item.provider_label,
      item && item.brand,
      item && item.seller,
      item && item.source_category,
      item && item.search_keyword,
      item && item.category_path
    ].filter(Boolean).join(" ");
  }

  function excludedKeyword(value) {
    const normalized = String(value || "").replace(/\s+/g, "").toLowerCase();
    if (!normalized) return false;
    return KEYWORD_EXCLUSION_TERMS.some((term) => {
      const needle = String(term || "").replace(/\s+/g, "").toLowerCase();
      return !!needle && normalized.indexOf(needle) >= 0;
    });
  }

  function visibleKeywordRow(item) {
    return !!(item && item.keyword && !excludedKeyword(item.keyword));
  }

  function keywordPathDisplay(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    if (text.indexOf("-") < 0 && text.indexOf("_") < 0) return text;
    return text.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  }

  function selectedKeywordsFromURL() {
    try {
      const pathKeywords = [];
      const parts = shoppingPathParts();
      const shoppingIndex = shoppingSegmentIndex(parts);
      if (shoppingIndex >= 0 && parts[shoppingIndex + 1] === "keyword" && parts[shoppingIndex + 2]) {
        pathKeywords.push(keywordPathDisplay(parts[shoppingIndex + 2]));
      }
      const params = new URLSearchParams(window.location.search || "");
      const repeated = params.getAll("keyword").concat(params.getAll("kw"));
      const joined = String(params.get("keywords") || "");
      const values = pathKeywords.concat(repeated).concat(joined ? joined.split(",") : []);
      const seen = {};
      const rows = [];
      values.forEach((value) => {
        const text = String(value || "").trim();
        const key = keywordKey(text);
        if (!text || !key || seen[key] || excludedKeyword(text)) return;
        seen[key] = true;
        rows.push(text);
      });
      return rows.slice(0, 8);
    } catch (_) {
      return [];
    }
  }

  function keywordDeepLinkQueryFromURL() {
    try {
      const parts = shoppingPathParts();
      const shoppingIndex = shoppingSegmentIndex(parts);
      if (shoppingIndex < 0 || parts[shoppingIndex + 1] !== "keyword" || !parts[shoppingIndex + 2]) return "";
      return selectedKeywordsFromURL().join(" ").trim();
    } catch (_) {
      return "";
    }
  }

  function keywordHref(lang, keywords) {
    const seen = {};
    const rows = [];
    (keywords || []).forEach((keyword) => {
      const text = String(keyword || "").trim();
      const key = keywordKey(text);
      if (!text || !key || seen[key] || excludedKeyword(text)) return;
      seen[key] = true;
      rows.push(text);
    });
    return rows.length ? keywordBasePath(lang) + encodeURIComponent(keywordKey(rows[0])) + "/" : keywordBasePath(lang);
  }

  function modeHref(lang, mode) {
    const selected = selectedKeywordsFromURL();
    if (mode === "keyword") {
      const href = selected.length ? keywordHref(lang, selected) : shoppingBasePath(lang);
      return href + (href.indexOf("?") >= 0 ? "&" : "?") + "mode=keyword";
    }
    return selected.length ? keywordHref(lang, selected) : shoppingBasePath(lang);
  }

  function currentCategorySlug() {
    try {
      const parts = shoppingPathParts();
      const shoppingIndex = shoppingSegmentIndex(parts);
      if (shoppingIndex < 0) return "";
      const type = parts[shoppingIndex + 1] || "";
      if (type === "keyword" || type === "product") return "";
      const slug = type === "category" ? (parts[shoppingIndex + 2] || "") : type;
      if (!slug || slug.indexOf("ajax_") === 0 || slug === "out" || slug === "select") return "";
      return categorySlug(slug);
    } catch (_) {
      return "";
    }
  }

  function selectedCategorySlugs() {
    const compare = compareSlugsFromURL();
    if (compare.length) return compare;
    const current = currentCategorySlug();
    return current ? uniqueCategorySlugs([current]) : [];
  }

  function categoryFromURL(radar) {
    if (radar && radar.scope_category) return radar.scope_category;
    const slug = currentCategorySlug();
    if (!slug) return "";
    const standard = standardCategoryName(slug);
    if (standard) return standard;
    const rows = categoryRows(radar);
    const found = rows.find((item) => categorySlug(item.source_category) === slug);
    return found && found.source_category ? found.source_category : "";
  }

  function syncCategoryURL(lang, category, replace) {
    if (!window.history || !window.history.pushState) return;
    const nextPath = categoryHref(lang, category);
    if (window.location.pathname === nextPath && !window.location.search) return;
    const method = replace ? "replaceState" : "pushState";
    window.history[method]({ statgroundShoppingCategory: category || "" }, "", nextPath);
  }

  function fetchJSON(url) {
    let target = url;
    let body = "";
    try {
      const parsed = new URL(url, window.location.origin);
      target = parsed.pathname;
      body = parsed.searchParams.toString();
    } catch (_) {}
    return fetch(target, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      credentials: "same-origin",
      body: body
    })
      .then((res) => res.text().then((text) => {
        let json = null;
        try { json = JSON.parse(text); } catch (_) {}
        return { ok: res.ok && !!(json && json.ok), status: res.status, json: json };
      }));
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function shouldRetryFetchResult(res) {
    if (!res) return true;
    const status = Number(res.status || 0);
    if (status === 401 || status === 403 || status === 404) return false;
    return !res.ok && (status === 0 || status === 408 || status === 429 || status >= 500 || status === 200);
  }

  function fetchJSONWithRetry(url, attempts) {
    const maxAttempts = Math.max(1, Number(attempts || 1));
    function run(index) {
      return fetchJSON(url).then((res) => {
        if (res && res.ok) return res;
        if (index + 1 < maxAttempts && shouldRetryFetchResult(res)) {
          return delay(250 * (index + 1)).then(() => run(index + 1));
        }
        return res;
      }).catch((err) => {
        if (index + 1 < maxAttempts) {
          return delay(250 * (index + 1)).then(() => run(index + 1));
        }
        throw err;
      });
    }
    return run(0);
  }

  function loadECharts() {
    if (window.echarts) return Promise.resolve(window.echarts);
    if (echartsPromise) return echartsPromise;
    echartsPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = ECHARTS_URL;
      script.defer = true;
      script.onload = () => window.echarts ? resolve(window.echarts) : reject(new Error("echarts_missing"));
      script.onerror = () => reject(new Error("echarts_load_failed"));
      document.head.appendChild(script);
    });
    return echartsPromise;
  }

  function productLabel(item) {
    const name = item && typeof item.product_name === "string" ? item.product_name.trim() : "";
    if (name) return name;
    return item && item.product_label ? item.product_label : (item && item.product_code ? "Observed item #" + item.product_code : "Observed item");
  }

  function imageURL(item) {
    const raw = String(item && item.image_url ? item.image_url : "").trim();
    if (!raw || !/^https?:\/\//i.test(raw)) return "";
    return raw;
  }

  function providerKey(item) {
    const raw = String(item && item.provider ? item.provider : "gmarket").trim().toLowerCase();
    return raw === "kurly" ? "kurly" : "gmarket";
  }

  function providerLabel(item) {
    const label = String(item && item.provider_label ? item.provider_label : "").trim();
    if (label) return label;
    return providerKey(item) === "kurly" ? "Kurly" : "Gmarket";
  }

  function providerBadge(item, compact) {
    const key = providerKey(item);
    const logo = providerLogos[key] || providerLogos.gmarket;
    const label = providerLabel(item);
    return [
      '<span class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-black text-slate-700 shadow-sm">',
      '<img src="' + esc(logo) + '" alt="' + esc(label) + '" loading="lazy" class="' + (compact ? "h-4 w-6" : "h-5 w-7") + ' rounded object-contain">',
      compact ? '' : '<span>' + esc(label) + '</span>',
      '</span>'
    ].join("");
  }

  function itemKey(item) {
    const code = String(item && item.product_code ? item.product_code : "").trim();
    return code ? providerKey(item) + ":" + code : "";
  }

  function productDetailPath(lang, item) {
    const code = String(item && item.product_code ? item.product_code : "").trim();
    if (!code) return "";
    return shoppingBasePath(lang) + "product/" + providerKey(item) + "/" + encodeURIComponent(code) + "/";
  }

  function productDetailTargetFromURL() {
    const parts = shoppingPathParts();
    const shoppingIndex = shoppingSegmentIndex(parts);
    if (shoppingIndex < 0 || parts[shoppingIndex + 1] !== "product") return null;
    const provider = String(parts[shoppingIndex + 2] || "").trim().toLowerCase();
    const productCode = String(parts[shoppingIndex + 3] || "").trim();
    if (!productCode) return null;
    return { provider: provider === "kurly" ? "kurly" : "gmarket", product_code: productCode };
  }

  function isProductDetailURL() {
    return !!productDetailTargetFromURL();
  }

  function syncProductDetailURL(lang, item) {
    if (!window.history || !window.history.pushState) return;
    const path = productDetailPath(lang, item);
    if (!path || window.location.pathname === path) return;
    if (!isProductDetailURL()) {
      window.__statgroundProductReturnURL = (window.location.pathname || shoppingBasePath(lang)) + (window.location.search || "") + (window.location.hash || "");
    }
    window.history.pushState({ statgroundShoppingProduct: itemKey(item) }, "", path);
  }

  function priceRangeKey(min, max) {
    const low = Math.max(0, Math.round(Number(min || 0)));
    const high = max === Infinity ? "inf" : String(Math.max(0, Math.round(Number(max || 0))));
    return "range:" + low + "-" + high;
  }

  function normalizePriceRange(raw) {
    if (!raw || raw.key === "all") return null;
    const min = Math.max(0, Math.round(Number(raw.min || 0)));
    const max = raw.max === Infinity || raw.max === "inf" ? Infinity : Math.round(Number(raw.max || 0));
    if (!Number.isFinite(min) || min < 0) return null;
    if (max !== Infinity && (!Number.isFinite(max) || max < min)) return null;
    if (min <= 0 && max === Infinity) return null;
    return {
      key: raw.key || priceRangeKey(min, max),
      min: min,
      max: max,
      label: raw.label || ""
    };
  }

  function currentPriceRange() {
    return normalizePriceRange(window.__statgroundSelectedPriceRange || null);
  }

  function activePriceRangeKey() {
    const range = currentPriceRange();
    return range ? range.key : "all";
  }

  function priceEvidenceKey(rawRange, category) {
    const range = normalizePriceRange(rawRange);
    if (!range) return "all";
    const max = range.max === Infinity ? "inf" : String(range.max);
    return [categorySlug(category || ""), String(range.min), max].join("|");
  }

  function currentPriceEvidenceCategory(radar) {
    return window.__statgroundSelectedMarketCategory || categoryFromURL(radar || window.__statgroundLastRadar) || "";
  }

  function priceEvidenceQueryParams(rawRange, category) {
    const range = normalizePriceRange(rawRange);
    const params = { limit: "60" };
    if (category) params.category = category;
    if (range) {
      if (range.min > 0) params.min_price = String(range.min);
      if (range.max !== Infinity) params.max_price = String(range.max);
    }
    return params;
  }

  function isPriceEvidenceLoading(radar) {
    const range = currentPriceRange();
    if (!range || !radar || !radar.__sg_price_evidence_loading) return false;
    return radar.__sg_price_evidence_loading === priceEvidenceKey(range, currentPriceEvidenceCategory(radar));
  }

  function priceRangeLabel(lang, raw) {
    const range = normalizePriceRange(raw);
    if (!range) return t(lang, "priceRangeAll");
    if (range.label) return range.label;
    if (range.min <= 0 && range.max !== Infinity) return "~" + krw(range.max);
    if (range.max === Infinity) return krw(range.min) + "~";
    return krw(range.min) + "~" + krw(range.max);
  }

  function priceRangeDataMax(max) {
    return max === Infinity ? "inf" : String(max);
  }

  function priceRangeBoundaries(rawBoundaries) {
    const rawRows = rawBoundaries || [];
    if (rawRows.length === 2) {
      const first = Math.round(Number(rawRows[0] || 0));
      const second = Math.round(Number(rawRows[1] || 0));
      if (Number.isFinite(first) && Number.isFinite(second) && first >= 0 && first === second) return [first, second];
    }
    const seen = {};
    const rows = rawRows
      .map((value) => Math.round(Number(value || 0)))
      .filter((value) => Number.isFinite(value) && value >= 0)
      .sort((a, b) => a - b)
      .filter((value) => {
        const key = String(value);
        if (seen[key]) return false;
        seen[key] = true;
        return true;
      });
    if (rows.length >= 2) return rows;
    return DEFAULT_PRICE_RANGE_BOUNDARIES.slice();
  }

  function priceRangeRoundUnit(value) {
    const n = Math.abs(Number(value || 0));
    if (n >= 1000000) return 100000;
    if (n >= 100000) return 10000;
    if (n >= 10000) return 1000;
    return 100;
  }

  function roundPriceForBoundary(value, direction) {
    const unit = priceRangeRoundUnit(value);
    const raw = Number(value || 0);
    if (!Number.isFinite(raw)) return 0;
    if (direction === "ceil") return Math.ceil(raw / unit) * unit;
    if (direction === "floor") return Math.floor(raw / unit) * unit;
    return Math.round(raw / unit) * unit;
  }

  function pushPositivePrice(out, value) {
    const price = Math.round(Number(value || 0));
    if (Number.isFinite(price) && price > 0) out.push(price);
  }

  function observedPriceExtent(radar) {
    const lows = [];
    const highs = [];
    let hasDirectMin = false;
    let hasZeroFloorBand = false;
    const summary = radar && radar.summary ? radar.summary : {};
    function pushLow(value, direct) {
      const before = lows.length;
      pushPositivePrice(lows, value);
      if (direct && lows.length > before) hasDirectMin = true;
    }
    function pushHigh(value) {
      pushPositivePrice(highs, value);
    }
    pushLow(summary.min_price_krw, true);
    pushHigh(summary.max_price_krw);
    ((radar && radar.price_range_slices) || []).forEach((slice) => {
      const range = priceRangeSliceRange(slice);
      if (!range) return;
      pushLow(range.min, true);
      if (range.max !== Infinity) pushHigh(range.max);
    });
    ((radar && radar.price_bands) || []).forEach((band) => {
      const min = Number(band && band.min_price_krw || 0);
      const max = Number(band && band.max_price_krw || 0);
      if (aggregateRowWeight(band) > 0 && min <= 0 && max > 0) hasZeroFloorBand = true;
      pushLow(min, false);
      pushHigh(max);
    });
    ((radar && radar.categories) || []).concat((radar && radar.keywords) || [], (radar && radar.category_keywords) || []).forEach((row) => {
      rowPriceMarkers(row).forEach((price) => {
        pushLow(price, false);
        pushHigh(price);
      });
    });
    uniqueShoppingItems(((radar && radar.products) || []).concat((radar && radar.deal_candidates) || [])).forEach((item) => {
      pushLow(item && item.price_krw, true);
      pushHigh(item && item.price_krw);
    });
    if (!hasDirectMin && hasZeroFloorBand) lows.push(1);
    if (!lows.length && !highs.length) return { min: 0, max: 0 };
    const min = lows.length ? Math.min.apply(null, lows) : Math.min.apply(null, highs);
    const max = highs.length ? Math.max.apply(null, highs) : Math.max.apply(null, lows);
    return { min: min, max: max };
  }

  function priceCriteriaRowsFromBands(radar, selectedCategory) {
    const extent = observedPriceExtent(radar);
    const rows = ((radar && radar.price_bands) || []).map((band, index) => {
      const count = aggregateRowWeight(band);
      if (!count) return null;
      let min = Number(band && band.min_price_krw || 0);
      let max = Number(band && band.max_price_krw || 0);
      if (!Number.isFinite(min) || min <= 0 || index === 0) min = extent.min || Math.max(1, min);
      if (!Number.isFinite(max) || max <= 0 || max < min) max = extent.max || min;
      if (max < min) max = min;
      return {
        product_code: "__sg_band_" + String(band && band.label || index),
        product_label: band && band.label ? String(band.label) : priceRangeLabel(routeLang(), { min: min, max: max }),
        source_category: selectedCategory || "",
        price_krw: priceRangeMidpoint(min, max),
        __sg_min_price: min,
        __sg_max_price: max,
        __sg_weight: count
      };
    }).filter(Boolean).sort((a, b) => Number(a.__sg_min_price || 0) - Number(b.__sg_min_price || 0));
    return splitPriceCriteriaRows(rows);
  }

  function splitPriceBoundary(row, index, total) {
    const min = Number(row && row.__sg_min_price || 0);
    const max = Number(row && row.__sg_max_price || 0);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= min) return min;
    const useLog = min >= 100000 && max / Math.max(min, 1) > 20;
    if (useLog) {
      const low = Math.log(min);
      const high = Math.log(max);
      return roundPriceForBoundary(Math.exp(low + ((high - low) * index) / total), "round");
    }
    return roundPriceForBoundary(min + ((max - min) * index) / total, "round");
  }

  function priceCriteriaSplitCount(row) {
    const count = aggregateRowWeight(row);
    const min = Number(row && row.__sg_min_price || 0);
    const max = Number(row && row.__sg_max_price || 0);
    if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return 1;
    if (min >= 100000 && max / Math.max(min, 1) > 20) return 4;
    if (count >= 5000) return 3;
    if (count >= 1200) return 2;
    return 1;
  }

  function splitPriceCriteriaRows(rows) {
    const out = [];
    (rows || []).forEach((row) => {
      const parts = priceCriteriaSplitCount(row);
      const min = Number(row && row.__sg_min_price || 0);
      const max = Number(row && row.__sg_max_price || 0);
      const count = aggregateRowWeight(row);
      if (parts <= 1 || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
        out.push(row);
        return;
      }
      let start = min;
      let remaining = count;
      for (let i = 1; i <= parts; i += 1) {
        let end = i === parts ? max : splitPriceBoundary(row, i, parts);
        end = Math.max(start, Math.min(max, Math.round(Number(end || 0))));
        if (end < start) end = start;
        const weight = i === parts ? Math.max(1, remaining) : Math.max(1, Math.round(count / parts));
        remaining -= weight;
        out.push(Object.assign({}, row, {
          product_label: priceRangeLabel(routeLang(), { min: start, max: end }),
          price_krw: priceRangeMidpoint(start, end),
          __sg_min_price: start,
          __sg_max_price: end,
          __sg_weight: weight
        }));
        start = end + 1;
        if (start > max) break;
      }
    });
    return out.filter((row) => aggregateRowWeight(row) > 0).sort((a, b) => Number(a.__sg_min_price || 0) - Number(b.__sg_min_price || 0));
  }

  function priceRangeBoundariesForItems(items) {
    const intervals = (items || [])
      .map((item) => ({
        min: Number(item && item.__sg_min_price || 0),
        max: Number(item && item.__sg_max_price || 0)
      }))
      .filter((row) => Number.isFinite(row.min) && row.min > 0 && Number.isFinite(row.max) && row.max > 0)
      .sort((a, b) => a.min - b.min || a.max - b.max);
    if (intervals.length) {
      const rows = [];
      intervals.forEach((row) => {
        const min = Math.round(row.min);
        const max = Math.round(row.max);
        const last = rows.length ? rows[rows.length - 1] : 0;
        if (!rows.length) {
          rows.push(min);
        } else if (min > last + 1) {
          rows.push(min - 1);
        }
        if (max > (rows[rows.length - 1] || 0)) rows.push(max);
      });
      if (rows.length >= 2) return priceRangeBoundaries(rows);
    }
    const prices = (items || [])
      .reduce((out, item) => {
        const min = Number(item && item.__sg_min_price || 0);
        const max = Number(item && item.__sg_max_price || 0);
        if (Number.isFinite(min) && min > 0) out.push(min);
        if (Number.isFinite(max) && max > 0 && max !== min) out.push(max);
        if (!min && !max) out.push(Number(item && item.price_krw || 0));
        return out;
      }, [])
      .filter((price) => Number.isFinite(price) && price > 0)
      .sort((a, b) => a - b);
    if (!prices.length) return DEFAULT_PRICE_RANGE_BOUNDARIES.slice();
    const min = prices[0];
    const max = prices[prices.length - 1];
    if (min === max) return priceRangeBoundaries([min, max]);
    const span = max - min;
    const rows = [min];
    for (let i = 1; i < 5; i += 1) {
      const boundary = roundPriceForBoundary(min + (span * i) / 5, "round");
      if (boundary > min && boundary < max) rows.push(boundary);
    }
    rows.push(max);
    return priceRangeBoundaries(rows);
  }

  function priceRangePresetsFromBoundaries(rawBoundaries) {
    const boundaries = priceRangeBoundaries(rawBoundaries);
    const rows = [{ key: "all", min: boundaries[0], max: boundaries[boundaries.length - 1] }];
    for (let i = 1; i < boundaries.length; i += 1) {
      const min = i === 1 ? boundaries[0] : boundaries[i - 1] + 1;
      const max = boundaries[i];
      if (max < min) continue;
      rows.push({ key: priceRangeKey(min, max), min: min, max: max });
    }
    return rows;
  }

  function priceRangeBoundaryData(boundaries) {
    return priceRangeBoundaries(boundaries).join(",");
  }

  function priceRangeBoundariesFromData(value) {
    return priceRangeBoundaries(String(value || "").split(","));
  }

  function priceRangeSliderMaxIndex(boundaries) {
    return priceRangeBoundaries(boundaries).length - 1;
  }

  function clampPriceRangeSliderIndex(value, boundaries) {
    const max = priceRangeSliderMaxIndex(boundaries);
    const n = Math.round(Number(value || 0));
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(max, n));
  }

  function priceRangeFromSliderIndexes(minIndex, maxIndex, rawBoundaries) {
    const boundaries = priceRangeBoundaries(rawBoundaries);
    let lowIndex = clampPriceRangeSliderIndex(minIndex, boundaries);
    let highIndex = clampPriceRangeSliderIndex(maxIndex, boundaries);
    const last = priceRangeSliderMaxIndex(boundaries);
    if (highIndex <= lowIndex) {
      if (lowIndex >= last) lowIndex = last - 1;
      highIndex = lowIndex + 1;
    }
    if (lowIndex <= 0 && highIndex >= last) return null;
    const lowBoundary = boundaries[lowIndex];
    const highBoundary = boundaries[highIndex];
    const min = lowIndex <= 0 ? Number(boundaries[0] || 0) : Number(lowBoundary || 0) + 1;
    const max = Number(highBoundary || 0);
    return normalizePriceRange({ key: priceRangeKey(min, max), min: min, max: max });
  }

  function priceRangeSliderIndexes(rawRange, rawBoundaries) {
    const boundaries = priceRangeBoundaries(rawBoundaries);
    const range = normalizePriceRange(rawRange);
    const last = priceRangeSliderMaxIndex(boundaries);
    if (!range) return { minIndex: 0, maxIndex: last };
    let minIndex = 0;
    let maxIndex = last;
    for (let i = 0; i < boundaries.length; i += 1) {
      const boundary = boundaries[i];
      if (Number(boundary || 0) + 1 <= Number(range.min || 0)) minIndex = i;
      if (range.max !== Infinity && Number(boundary || 0) >= Number(range.max || 0)) {
        maxIndex = i;
        break;
      }
    }
    if (maxIndex <= minIndex) maxIndex = Math.min(last, minIndex + 1);
    return { minIndex: minIndex, maxIndex: maxIndex };
  }

  function priceRangeSliderPercent(index, boundaries) {
    const last = priceRangeSliderMaxIndex(boundaries);
    if (!last) return 0;
    return Math.round((1000 * clampPriceRangeSliderIndex(index, boundaries)) / last) / 10;
  }

  function priceRangeBoundaryLabel(index, rawBoundaries) {
    const boundaries = priceRangeBoundaries(rawBoundaries);
    const boundary = boundaries[clampPriceRangeSliderIndex(index, boundaries)];
    return krw(boundary);
  }

  function priceRangeBoundaryTicksHTML(rawBoundaries) {
    const boundaries = priceRangeBoundaries(rawBoundaries);
    const last = boundaries.length - 1;
    const every = boundaries.length <= 8 ? 1 : Math.ceil(last / 6);
    return boundaries.map((_, index) => {
      const show = index === 0 || index === last || index % every === 0;
      return '<span class="min-w-0 flex-1 text-center">' + (show ? esc(priceRangeBoundaryLabel(index, boundaries)) : '&nbsp;') + '</span>';
    }).join("");
  }

  function parsePriceRangeInput(value, fallback) {
    const text = String(value || "").replace(/,/g, "").trim();
    if (!text) return fallback;
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function rowRepresentativePrice(row) {
    const values = [
      row && row.price_krw,
      row && row.median_price_krw,
      row && row.p50_price_krw,
      row && row.category_median_price_krw,
      row && row.p25_price_krw,
      row && row.p75_price_krw
    ];
    for (let i = 0; i < values.length; i += 1) {
      const price = Number(values[i] || 0);
      if (Number.isFinite(price) && price > 0) return price;
    }
    return 0;
  }

  function rowPriceMarkers(row) {
    return [
      row && row.min_price_krw,
      row && row.p25_price_krw,
      row && row.median_price_krw,
      row && row.p50_price_krw,
      row && row.category_median_price_krw,
      row && row.p75_price_krw,
      row && row.max_price_krw,
      row && row.price_krw
    ].map((value) => Number(value || 0)).filter((value, index, list) => Number.isFinite(value) && value > 0 && list.indexOf(value) === index);
  }

  function priceInRange(price, rawRange) {
    const range = normalizePriceRange(rawRange);
    if (!range) return true;
    const value = Number(price || 0);
    return Number.isFinite(value) && value > 0 && value >= range.min && value <= range.max;
  }

  function itemPriceInRange(item, rawRange) {
    const range = normalizePriceRange(rawRange);
    if (!range) return true;
    const min = Number(item && item.__sg_min_price || 0);
    const max = Number(item && item.__sg_max_price || 0);
    if (Number.isFinite(min) && min > 0 && Number.isFinite(max) && max > 0) return rangeOverlaps(min, max, range);
    return priceInRange(item && item.price_krw, range);
  }

  function filterRowsByPriceRange(rows, rawRange) {
    const range = normalizePriceRange(rawRange);
    if (!range) return (rows || []).slice();
    return (rows || []).filter((row) => priceInRange(rowRepresentativePrice(row), range));
  }

  function filterItemsByPriceRange(items, rawRange) {
    const range = normalizePriceRange(rawRange);
    if (!range) return (items || []).slice();
    return (items || []).filter((item) => itemPriceInRange(item, range));
  }

  function aggregateRowWeight(row) {
    const weight = Number(row && (row.__sg_weight || row.product_count || row.count) || 0);
    if (!Number.isFinite(weight) || weight <= 0) return 0;
    return Math.round(weight);
  }

  function weightedCriteriaCount(items) {
    return (items || []).reduce((sum, item) => sum + aggregateRowWeight(item), 0);
  }

  function finitePriceMax(value) {
    const max = Number(value || 0);
    return Number.isFinite(max) && max > 0 ? max : Infinity;
  }

  function rangeOverlaps(min, max, rawRange) {
    const range = normalizePriceRange(rawRange);
    if (!range) return true;
    const low = Number(min || 0);
    const high = finitePriceMax(max);
    if (!Number.isFinite(low) || low <= 0) return false;
    return low <= range.max && high >= range.min;
  }

  function priceRangeMidpoint(min, max) {
    const low = Number(min || 0);
    const high = finitePriceMax(max);
    if (!Number.isFinite(low) || low <= 0) return 0;
    if (high === Infinity) return low;
    return Math.round((low + high) / 2);
  }

  function uniqueShoppingItems(items) {
    const seen = {};
    const rows = [];
    (items || []).forEach((item) => {
      if (!item) return;
      const key = itemKey(item) || [providerKey(item), productLabel(item), item.price_krw || "", item.source_category || ""].join(":");
      if (!key || seen[key]) return;
      seen[key] = true;
      rows.push(item);
    });
    return rows;
  }

  function mergeRowsByKey(baseRows, addRows, keyFn) {
    const seen = {};
    const rows = [];
    function add(row) {
      const key = keyFn(row);
      if (!key) return;
      if (seen[key]) {
        const index = seen[key] - 1;
        rows[index] = Object.assign({}, rows[index], row);
        return;
      }
      seen[key] = rows.length + 1;
      rows.push(row);
    }
    (baseRows || []).forEach(add);
    (addRows || []).forEach(add);
    return rows;
  }

  function keywordSearchPayload(result) {
    const nested = result && result.result;
    if (nested && typeof nested === "object" && !Array.isArray(nested)) return nested;
    return result || {};
  }

  function keywordSearchPayloadQuery(payload) {
    return String((payload && (payload.query || payload.q)) || window.__statgroundKeywordSearchQuery || "").trim();
  }

  function markKeywordSearchRows(rows, query) {
    const q = String(query || "").trim();
    return (rows || []).map((row, index) => Object.assign({}, row, {
      __sg_keyword_search_query: q,
      __sg_keyword_search_rank: index + 1
    }));
  }

  function mergeKeywordSearchIntoSlices(slices, keywords, categoryKeywords, products) {
    if (!slices || !slices.length) return [];
    return slices.map((slice) => {
      const range = priceRangeSliceRange(slice);
      if (!range) return slice;
      const sliceKeywords = (keywords || []).filter((row) => priceInRange(rowRepresentativePrice(row), range));
      const sliceCategoryKeywords = (categoryKeywords || []).filter((row) => priceInRange(rowRepresentativePrice(row), range));
      const sliceProducts = (products || []).filter((item) => itemPriceInRange(item, range));
      if (!sliceKeywords.length && !sliceCategoryKeywords.length && !sliceProducts.length) return slice;
      return Object.assign({}, slice, {
        keywords: mergeRowsByKey((slice && slice.keywords) || [], sliceKeywords, (row) => keywordKey(row && row.keyword)),
        category_keywords: mergeRowsByKey((slice && slice.category_keywords) || [], sliceCategoryKeywords, (row) => normalizedCategorySlug(row && row.source_category) + "::" + keywordKey(row && row.keyword)),
        products: uniqueShoppingItems(sliceProducts.concat((slice && slice.products) || []))
      });
    });
  }

  function searchPriceBands(products, rows) {
    const sourceProducts = products && products.length ? products : [];
    const buckets = bucketPrices(sourceProducts);
    if (!sourceProducts.length) {
      (rows || []).forEach((row) => {
        const price = rowRepresentativePrice(row);
        const weight = aggregateRowWeight(row);
        if (!price || !weight) return;
        const bucket = buckets.find((item) => price >= item.min && price <= item.max);
        if (bucket) bucket.count += weight;
      });
    }
    const total = buckets.reduce((sum, row) => sum + Number(row.count || 0), 0);
    return buckets.map((row) => ({
      label: row.label,
      min_price_krw: row.min,
      max_price_krw: row.max === Infinity ? 0 : row.max,
      product_count: Number(row.count || 0),
      count: Number(row.count || 0),
      product_percent: total ? ratioPercent(row.count || 0, total) : 0
    }));
  }

  function searchCategoryRows(categoryKeywords, products) {
    const buckets = {};
    function ensure(category) {
      const standard = standardCategoryName(category || "");
      if (!standard) return null;
      if (!buckets[standard]) {
        buckets[standard] = {
          source_category: standard,
          product_count: 0,
          seller_count: 0,
          brand_count: 0,
          review_sum: 0,
          order_sum: 0,
          discounted_count: 0,
          low_price_count: 0,
          min_price_krw: 0,
          max_price_krw: 0,
          p25_price_krw: 0,
          median_price_krw: 0,
          p75_price_krw: 0,
          demand_score: 0,
          competition_score: 0,
          opportunity_score: 0,
          __sg_weight: 0
        };
      }
      return buckets[standard];
    }
    (categoryKeywords || []).forEach((row) => {
      const bucket = ensure(row && row.source_category);
      if (!bucket) return;
      const weight = Math.max(1, Number(row && row.product_count || 0));
      bucket.product_count += Number(row && row.product_count || 0);
      bucket.seller_count += Number(row && row.seller_count || 0);
      bucket.brand_count += Number(row && row.brand_count || 0);
      bucket.review_sum += Number(row && row.review_sum || 0);
      bucket.order_sum += Number(row && row.order_sum || 0);
      bucket.p25_price_krw += Number(row && row.p25_price_krw || 0) * weight;
      bucket.median_price_krw += Number(row && row.median_price_krw || 0) * weight;
      bucket.p75_price_krw += Number(row && row.p75_price_krw || 0) * weight;
      bucket.demand_score += Number(row && row.demand_score || 0) * weight;
      bucket.competition_score += Number(row && row.competition_score || 0) * weight;
      bucket.opportunity_score += Number(row && row.opportunity_score || 0) * weight;
      bucket.__sg_weight += weight;
    });
    (products || []).forEach((item) => {
      const bucket = ensure(item && item.source_category);
      if (!bucket) return;
      bucket.product_count += 1;
      const price = Number(item && item.price_krw || 0);
      if (price > 0 && (!bucket.min_price_krw || price < bucket.min_price_krw)) bucket.min_price_krw = price;
      if (price > bucket.max_price_krw) bucket.max_price_krw = price;
      if (item && Number(item.original_price_krw || 0) > price && price > 0) bucket.discounted_count += 1;
      if (item && Number(item.category_median_price_krw || 0) > price && price > 0) bucket.low_price_count += 1;
    });
    return Object.keys(buckets).map((key) => {
      const row = buckets[key];
      const weight = row.__sg_weight || Math.max(1, row.product_count);
      ["p25_price_krw", "median_price_krw", "p75_price_krw", "demand_score", "competition_score", "opportunity_score"].forEach((field) => {
        row[field] = Math.round(Number(row[field] || 0) / weight);
      });
      row.low_price_percent = ratioPercent(row.low_price_count, row.product_count);
      row.discounted_percent = ratioPercent(row.discounted_count, row.product_count);
      row.price_gap_score = row.opportunity_score;
      delete row.__sg_weight;
      return row;
    }).sort((a, b) => Number(b.product_count || 0) - Number(a.product_count || 0));
  }

  function searchSummary(baseSummary, query, keywords, categoryKeywords, products, categories, priceBands) {
    const directRows = (keywords || []).filter((row) => keywordRowMatchesSearchQuery(row, query));
    const metricRows = directRows.length ? directRows : ((keywords || []).concat(categoryKeywords || []));
    const productTotal = metricRows.reduce((sum, row) => sum + Number(row && row.product_count || 0), 0) || products.length;
    const prices = [];
    (products || []).forEach((item) => {
      const price = Number(item && item.price_krw || 0);
      if (Number.isFinite(price) && price > 0) prices.push(price);
    });
    metricRows.forEach((row) => {
      rowPriceMarkers(row).forEach((price) => prices.push(price));
    });
    const discountedCount = (products || []).filter((item) => Number(item && item.original_price_krw || 0) > Number(item && item.price_krw || 0)).length;
    const lowPriceCount = (products || []).filter((item) => Number(item && item.category_median_price_krw || 0) > Number(item && item.price_krw || 0)).length;
    const categoryCount = uniqueCategorySlugs((categories || []).map((row) => row && row.source_category)).length;
    return Object.assign({}, baseSummary || {}, {
      product_count: productTotal,
      category_count: categoryCount,
      min_price_krw: prices.length ? Math.min.apply(null, prices) : 0,
      max_price_krw: prices.length ? Math.max.apply(null, prices) : 0,
      median_price_krw: weightedMedianFromRows(metricRows) || medianValue(prices),
      discounted_count: discountedCount,
      discounted_percent: productTotal ? ratioPercent(discountedCount, productTotal) : 0,
      low_price_count: lowPriceCount,
      low_price_percent: productTotal ? ratioPercent(lowPriceCount, productTotal) : 0,
      latest_collected_at: (baseSummary && baseSummary.latest_collected_at) || ""
    });
  }

  function mergeKeywordSearchResult(radar, result) {
    const payload = keywordSearchPayload(result);
    const query = keywordSearchPayloadQuery(payload);
    const keywords = markKeywordSearchRows(((payload && payload.keywords) || []).filter(visibleKeywordRow), query);
    const categoryKeywords = markKeywordSearchRows(((payload && payload.category_keywords) || []).filter(visibleKeywordRow), query);
    const products = uniqueShoppingItems((payload && payload.products) || []);
    if (!keywords.length && !categoryKeywords.length && !products.length) return radar;
    const categories = searchCategoryRows(categoryKeywords, products);
    const bands = searchPriceBands(products, keywords.concat(categoryKeywords));
    const next = Object.assign({}, radar || {});
    next.__sg_keyword_search_query = query;
    next.keywords = keywords;
    next.category_keywords = categoryKeywords;
    next.products = products;
    next.deal_candidates = [];
    next.price_drops = [];
    next.categories = categories;
    next.category_options = (radar && radar.category_options) || categories;
    next.seller_insights = categories;
    next.price_bands = bands;
    next.price_range_slices = [];
    next.summary = searchSummary(radar && radar.summary, query, keywords, categoryKeywords, products, categories, bands);
    return next;
  }

  function medianValue(values) {
    const rows = (values || []).map((value) => Number(value || 0)).filter((value) => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
    if (!rows.length) return 0;
    const mid = Math.floor(rows.length / 2);
    return rows.length % 2 ? rows[mid] : Math.round((rows[mid - 1] + rows[mid]) / 2);
  }

  function percentileValue(values, ratio) {
    const rows = (values || []).map((value) => Number(value || 0)).filter((value) => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
    if (!rows.length) return 0;
    const index = Math.max(0, Math.min(rows.length - 1, Math.round((rows.length - 1) * Number(ratio || 0))));
    return rows[index];
  }

  function weightedMedianFromRows(rows) {
    const points = [];
    (rows || []).forEach((row) => {
      const price = rowRepresentativePrice(row);
      const weight = aggregateRowWeight(row);
      if (price > 0 && weight > 0) points.push({ price: price, weight: weight });
    });
    points.sort((a, b) => a.price - b.price);
    const total = points.reduce((sum, point) => sum + point.weight, 0);
    if (!total) return 0;
    let acc = 0;
    for (let i = 0; i < points.length; i += 1) {
      acc += points[i].weight;
      if (acc >= total / 2) return points[i].price;
    }
    return points[points.length - 1].price;
  }

  function priceRangeSliceRange(slice) {
    if (!slice || slice.key === "all") return null;
    return normalizePriceRange({
      key: slice.key || priceRangeKey(slice.min_price_krw, slice.max_price_krw || Infinity),
      min: Number(slice.min_price_krw || 0),
      max: finitePriceMax(slice.max_price_krw)
    });
  }

  function priceRangeSliceForRange(radar, rawRange) {
    const range = normalizePriceRange(rawRange);
    if (!radar || !range) return null;
    const slices = radar.price_range_slices || [];
    const key = priceRangeKey(range.min, range.max);
    for (let i = 0; i < slices.length; i += 1) {
      const sliceRange = priceRangeSliceRange(slices[i]);
      if (!sliceRange) continue;
      if ((slices[i].key && slices[i].key === key) || (sliceRange.min === range.min && sliceRange.max === range.max)) return slices[i];
    }
    return null;
  }

  function priceRangeSlicesForRange(radar, rawRange) {
    const range = normalizePriceRange(rawRange);
    if (!radar || !range) return [];
    return ((radar && radar.price_range_slices) || []).filter((slice) => {
      const sliceRange = priceRangeSliceRange(slice);
      return sliceRange && rangeOverlaps(sliceRange.min, sliceRange.max, range);
    });
  }

  function mergeRangeRows(rows, keyFn) {
    const byKey = {};
    const sumFields = ["product_count", "seller_count", "brand_count", "review_sum", "order_sum", "discounted_count", "low_price_count"];
    const weightedFields = ["median_price_krw", "p25_price_krw", "p75_price_krw", "category_median_price_krw", "demand_score", "competition_score", "saturation_score", "opportunity_score", "price_gap_score"];
    (rows || []).forEach((row) => {
      if (!row) return;
      const key = keyFn(row);
      if (!key) return;
      const weight = Math.max(1, aggregateRowWeight(row));
      if (!byKey[key]) {
        byKey[key] = Object.assign({}, row, {
          product_count: 0,
          seller_count: 0,
          brand_count: 0,
          review_sum: 0,
          order_sum: 0,
          discounted_count: 0,
          low_price_count: 0,
          categories: [],
          __sg_merge_weight: 0,
          __sg_weighted: {}
        });
      }
      const out = byKey[key];
      sumFields.forEach((field) => {
        out[field] = Number(out[field] || 0) + Number(row[field] || 0);
      });
      out.__sg_merge_weight += weight;
      weightedFields.forEach((field) => {
        const value = Number(row[field] || 0);
        if (!Number.isFinite(value) || value <= 0) return;
        out.__sg_weighted[field] = Number(out.__sg_weighted[field] || 0) + value * weight;
      });
      if (Array.isArray(row.categories)) out.categories = uniqueText(out.categories.concat(row.categories));
    });
    return Object.keys(byKey).map((key) => {
      const row = byKey[key];
      const weight = Number(row.__sg_merge_weight || 0) || 1;
      Object.keys(row.__sg_weighted || {}).forEach((field) => {
        const value = row.__sg_weighted[field] / weight;
        row[field] = field.indexOf("_score") >= 0 ? Math.round(value * 10) / 10 : Math.round(value);
      });
      if (Number(row.p75_price_krw || 0) > 0 && Number(row.p25_price_krw || 0) > 0) {
        row.iqr_price_krw = Math.max(0, Number(row.p75_price_krw || 0) - Number(row.p25_price_krw || 0));
      }
      if (Number(row.product_count || 0) > 0) {
        row.discounted_percent = ratioPercent(row.discounted_count || 0, row.product_count || 0);
        row.low_price_percent = ratioPercent(row.low_price_count || 0, row.product_count || 0);
      }
      delete row.__sg_merge_weight;
      delete row.__sg_weighted;
      return row;
    }).sort((a, b) => {
      const opportunity = Number(b.opportunity_score || 0) - Number(a.opportunity_score || 0);
      if (opportunity) return opportunity;
      return Number(b.product_count || 0) - Number(a.product_count || 0);
    });
  }

  function priceBandsFromRangeSlices(slices, rawRange) {
    const range = normalizePriceRange(rawRange);
    const rows = (slices || []).map((slice) => {
      const sliceRange = priceRangeSliceRange(slice);
      if (!sliceRange) return null;
      const count = Number(slice && slice.summary && slice.summary.product_count || slice.product_count || 0);
      if (count <= 0) return null;
      return {
        label: slice.label || priceRangeLabel(routeLang(), sliceRange),
        min_price_krw: Math.max(sliceRange.min, range ? range.min : sliceRange.min),
        max_price_krw: Math.min(sliceRange.max, range && range.max !== Infinity ? range.max : sliceRange.max),
        product_count: count,
        review_sum: Number(slice && slice.summary && slice.summary.history_product_runs || 0),
        order_sum: 0,
        interpretation: ""
      };
    }).filter(Boolean);
    const total = rows.reduce((sum, row) => sum + aggregateRowWeight(row), 0);
    return rows.map((row) => Object.assign({}, row, {
      product_percent: total ? ratioPercent(aggregateRowWeight(row), total) : 0,
      reaction_percent: 0
    }));
  }

  function summaryFromRangeSlices(radar, rawRange, slices, bands, categories, keywords, categoryKeywords, evidenceItems) {
    const base = radar && radar.summary ? radar.summary : {};
    const range = normalizePriceRange(rawRange);
    const summaries = (slices || []).map((slice) => slice && slice.summary ? slice.summary : {}).filter(Boolean);
    const total = summaries.reduce((sum, row) => sum + Number(row.product_count || 0), 0);
    const discountedCount = summaries.reduce((sum, row) => sum + Number(row.discounted_count || 0), 0);
    const lowPriceCount = summaries.reduce((sum, row) => sum + Number(row.low_price_count || 0), 0);
    const medianRows = summaries.map((row) => ({ product_count: Number(row.product_count || 0), median_price_krw: Number(row.median_price_krw || 0) })).filter((row) => row.product_count > 0 && row.median_price_krw > 0);
    const fallback = buildAggregatePriceRangeSummary(radar, rawRange, bands, categories, keywords, categoryKeywords, evidenceItems);
    return Object.assign({}, base, fallback, {
      product_count: total || Number(fallback.product_count || 0),
      category_count: categories && categories.length ? uniqueCategorySlugs(categories.map((row) => row && row.source_category)).length : Number(fallback.category_count || 0),
      min_price_krw: range ? range.min : Number(fallback.min_price_krw || 0),
      max_price_krw: range && range.max !== Infinity ? range.max : Number(fallback.max_price_krw || 0),
      median_price_krw: weightedMedianFromRows(medianRows) || Number(fallback.median_price_krw || 0),
      discounted_count: discountedCount || Number(fallback.discounted_count || 0),
      discounted_percent: total ? ratioPercent(discountedCount, total) : Number(fallback.discounted_percent || 0),
      low_price_count: lowPriceCount || Number(fallback.low_price_count || 0),
      low_price_percent: total ? ratioPercent(lowPriceCount, total) : Number(fallback.low_price_percent || 0)
    });
  }

  function combinedPriceRangeSliceRadar(radar, rawRange, slices) {
    const range = normalizePriceRange(rawRange);
    const products = filterItemsByPriceRange(uniqueShoppingItems((slices || []).reduce((items, slice) => items.concat((slice && slice.products) || []), [])), range);
    const deals = filterItemsByPriceRange(uniqueShoppingItems((slices || []).reduce((items, slice) => items.concat((slice && slice.deal_candidates) || []), [])), range);
    const drops = filterItemsByPriceRange(uniqueShoppingItems((slices || []).reduce((items, slice) => items.concat((slice && slice.price_drop_candidates) || []), [])), range);
    const categories = mergeRangeRows((slices || []).reduce((items, slice) => items.concat((slice && slice.categories) || []), []), (row) => normalizedCategorySlug(row && row.source_category)).slice(0, 40);
    const keywords = mergeRangeRows((slices || []).reduce((items, slice) => items.concat((slice && slice.keywords) || []), []), (row) => keywordKey(row && row.keyword)).filter(visibleKeywordRow).slice(0, 240);
    const categoryKeywords = mergeRangeRows((slices || []).reduce((items, slice) => items.concat((slice && slice.category_keywords) || []), []), (row) => normalizedCategorySlug(row && row.source_category) + "::" + keywordKey(row && row.keyword)).filter(visibleKeywordRow).slice(0, 800);
    const sellerInsights = mergeRangeRows((slices || []).reduce((items, slice) => items.concat((slice && slice.seller_insights) || []), []), (row) => normalizedCategorySlug(row && row.source_category)).slice(0, 40);
    const bands = priceBandsFromRangeSlices(slices, range);
    return Object.assign({}, radar, {
      products: products,
      deal_candidates: deals,
      price_drops: drops,
      keywords: keywords,
      category_keywords: categoryKeywords,
      categories: categories,
      category_options: (radar && radar.category_options) || [],
      seller_insights: sellerInsights.length ? sellerInsights : filterRowsByPriceRange((radar && radar.seller_insights) || [], range),
      price_bands: bands,
      summary: summaryFromRangeSlices(radar, range, slices, bands, categories, keywords, categoryKeywords, products.concat(deals))
    });
  }

  function priceRangeOverlapRatio(min, max, rawRange) {
    const range = normalizePriceRange(rawRange);
    if (!range) return 1;
    const low = Number(min || 0);
    const high = Number(max || 0);
    if (!Number.isFinite(low) || !Number.isFinite(high) || low <= 0 || high < low) return 0;
    const overlapLow = Math.max(low, range.min);
    const overlapHigh = Math.min(high, range.max === Infinity ? high : range.max);
    if (overlapHigh < overlapLow) return 0;
    if (low >= 100000 && high / Math.max(low, 1) > 20) {
      const denom = Math.log(high + 1) - Math.log(low);
      if (denom <= 0) return 0;
      return Math.max(0, Math.min(1, (Math.log(overlapHigh + 1) - Math.log(overlapLow)) / denom));
    }
    const denom = Math.max(1, high - low + 1);
    return Math.max(0, Math.min(1, (overlapHigh - overlapLow + 1) / denom));
  }

  function scaledPriceBandRow(row, rawRange, extent) {
    const range = normalizePriceRange(rawRange);
    if (!range || !row) return row;
    let min = Number(row.min_price_krw || 0);
    let max = Number(row.max_price_krw || 0);
    if (min <= 0) min = extent && extent.min ? extent.min : 1;
    if (!max || max < min) max = extent && extent.max ? extent.max : max;
    const ratio = priceRangeOverlapRatio(min, max, range);
    if (ratio <= 0) return null;
    const out = Object.assign({}, row, {
      min_price_krw: Math.max(min, range.min),
      max_price_krw: Math.min(max, range.max === Infinity ? max : range.max)
    });
    ["product_count", "count", "discounted_count", "low_price_count", "review_sum", "order_sum"].forEach((field) => {
      if (out[field] === undefined) return;
      out[field] = Math.max(0, Math.round(Number(out[field] || 0) * ratio));
    });
    out.product_count = Math.max(1, Number(out.product_count || out.count || 0));
    out.count = Number(out.count || out.product_count || 0);
    return out;
  }

  function filterPriceBandsByRange(bands, rawRange, extent) {
    const range = normalizePriceRange(rawRange);
    if (!range) return (bands || []).slice();
    const rows = (bands || []).map((band) => scaledPriceBandRow(band, range, extent)).filter(Boolean);
    const total = rows.reduce((sum, row) => sum + aggregateRowWeight(row), 0);
    return rows.map((row) => Object.assign({}, row, {
      product_percent: total ? ratioPercent(aggregateRowWeight(row), total) : Number(row && row.product_percent || 0)
    }));
  }

  function buildAggregatePriceRangeSummary(radar, rawRange, bands, categories, keywords, categoryKeywords, evidenceItems) {
    const base = radar && radar.summary ? radar.summary : {};
    const range = normalizePriceRange(rawRange);
    const categoryRows = categories && categories.length ? categories : [];
    const keywordRows = keywords && keywords.length ? keywords : [];
    const edgeRows = categoryKeywords && categoryKeywords.length ? categoryKeywords : [];
    const aggregateRows = categoryRows.length ? categoryRows : (keywordRows.length ? keywordRows : edgeRows);
    const bandTotal = (bands || []).reduce((sum, row) => sum + aggregateRowWeight(row), 0);
    const aggregateTotal = aggregateRows.reduce((sum, row) => sum + aggregateRowWeight(row), 0);
    const evidenceRows = uniqueShoppingItems(evidenceItems || []);
    const evidenceTotal = evidenceRows.length;
    const total = bandTotal || aggregateTotal || evidenceTotal || Number(base.product_count || 0);
    const prices = [];
    (bands || []).forEach((row) => {
      rowPriceMarkers(row).forEach((price) => prices.push(price));
    });
    aggregateRows.forEach((row) => {
      rowPriceMarkers(row).forEach((price) => prices.push(price));
    });
    if (!prices.length) {
      evidenceRows.forEach((item) => {
        const price = Number(item && item.price_krw || 0);
        if (Number.isFinite(price) && price > 0) prices.push(price);
      });
    }
    const discountedCount = categoryRows.reduce((sum, row) => sum + Number(row && row.discounted_count || 0), 0);
    const lowPriceCount = categoryRows.reduce((sum, row) => sum + Number(row && row.low_price_count || 0), 0);
    const median = weightedMedianFromRows(aggregateRows.length ? aggregateRows : bands);
    const finiteMax = range && range.max !== Infinity ? range.max : 0;
    return Object.assign({}, base, {
      product_count: total,
      category_count: categoryRows.length ? uniqueCategorySlugs(categoryRows.map((row) => row && row.source_category)).length : Number(base.category_count || 0),
      min_price_krw: range ? range.min : (prices.length ? Math.min.apply(null, prices) : Number(base.min_price_krw || 0)),
      max_price_krw: finiteMax || (prices.length ? Math.max.apply(null, prices) : Number(base.max_price_krw || 0)),
      median_price_krw: median || medianValue(prices) || Number(base.median_price_krw || 0),
      discounted_count: discountedCount || Number(base.discounted_count || 0),
      discounted_percent: discountedCount ? ratioPercent(discountedCount, total) : Number(base.discounted_percent || 0),
      low_price_count: lowPriceCount || Number(base.low_price_count || 0),
      low_price_percent: lowPriceCount ? ratioPercent(lowPriceCount, total) : Number(base.low_price_percent || 0)
    });
  }

  function priceFilteredRadar(radar, rawRange) {
    const range = normalizePriceRange(rawRange);
    if (!radar || !range) return radar;
    const slice = priceRangeSliceForRange(radar, range);
    if (slice) {
      return Object.assign({}, radar, {
        products: filterItemsByPriceRange((slice && slice.products) || [], range),
        deal_candidates: filterItemsByPriceRange((slice && slice.deal_candidates) || [], range),
        price_drops: filterItemsByPriceRange((slice && slice.price_drop_candidates) || [], range),
        keywords: ((slice && slice.keywords) || []).filter(visibleKeywordRow),
        category_keywords: ((slice && slice.category_keywords) || []).filter(visibleKeywordRow),
        categories: (slice && slice.categories) || [],
        category_options: (radar && radar.category_options) || [],
        seller_insights: (slice && slice.seller_insights) || filterRowsByPriceRange((radar && radar.seller_insights) || [], range),
        price_bands: (slice && slice.price_bands) || [],
        summary: (slice && slice.summary) || buildAggregatePriceRangeSummary(radar, range, (slice && slice.price_bands) || [], (slice && slice.categories) || [], (slice && slice.keywords) || [], (slice && slice.category_keywords) || [], ((slice && slice.products) || []).concat((slice && slice.deal_candidates) || []))
      });
    }
    const products = filterItemsByPriceRange((radar && radar.products) || [], range);
    const deals = filterItemsByPriceRange((radar && radar.deal_candidates) || [], range);
    const drops = filterItemsByPriceRange((radar && radar.price_drops) || [], range);
    const bands = filterPriceBandsByRange((radar && radar.price_bands) || [], range, observedPriceExtent(radar));
    const categories = filterRowsByPriceRange((radar && radar.categories) || [], range);
    const categoryOptions = filterRowsByPriceRange((radar && radar.category_options) || [], range);
    const keywords = filterRowsByPriceRange(((radar && radar.keywords) || []).filter(visibleKeywordRow), range);
    const categoryKeywords = filterRowsByPriceRange(((radar && radar.category_keywords) || []).filter(visibleKeywordRow), range);
    if (bands.length) {
      return Object.assign({}, radar, {
        products: products,
        deal_candidates: deals,
        price_drops: drops,
        keywords: keywords,
        category_keywords: categoryKeywords,
        categories: categories,
        category_options: categoryOptions,
        seller_insights: filterRowsByPriceRange((radar && radar.seller_insights) || [], range),
        price_bands: bands,
        summary: buildAggregatePriceRangeSummary(radar, range, bands, categories, keywords, categoryKeywords, products.concat(deals))
      });
    }
    const slices = priceRangeSlicesForRange(radar, range);
    if (slices.length) return combinedPriceRangeSliceRadar(radar, range, slices);
    return Object.assign({}, radar, {
      products: products,
      deal_candidates: deals,
      price_drops: drops,
      keywords: keywords,
      category_keywords: categoryKeywords,
      categories: categories,
      category_options: categoryOptions,
      seller_insights: filterRowsByPriceRange((radar && radar.seller_insights) || [], range),
      price_bands: bands,
      summary: buildAggregatePriceRangeSummary(radar, range, bands, categories, keywords, categoryKeywords, products.concat(deals))
    });
  }

  function itemMatchesCategory(item, selectedCategory) {
    if (!selectedCategory) return true;
    return normalizedCategorySlug(item && item.source_category) === normalizedCategorySlug(selectedCategory);
  }

  function priceCriteriaItems(radar, selectedCategory, selectedKeywords, mode) {
    const rows = [];
    const bandRows = priceCriteriaRowsFromBands(radar, selectedCategory);
    if (bandRows.length) return bandRows;
    ((radar && radar.price_range_slices) || []).forEach((slice) => {
      const sliceRange = priceRangeSliceRange(slice);
      if (!sliceRange) return;
      const count = Number(slice && slice.summary && slice.summary.product_count || slice.product_count || 0);
      if (count <= 0) return;
      rows.push({
        product_code: "__sg_range_" + (slice.key || priceRangeKey(sliceRange.min, sliceRange.max)),
        product_label: slice.label || priceRangeLabel(routeLang(), sliceRange),
        source_category: selectedCategory || "",
        price_krw: priceRangeMidpoint(sliceRange.min, sliceRange.max),
        __sg_min_price: sliceRange.min,
        __sg_max_price: sliceRange.max === Infinity ? 0 : sliceRange.max,
        __sg_weight: count
      });
    });
    if (!rows.length) {
      ((radar && radar.price_bands) || []).forEach((band) => {
        const count = aggregateRowWeight(band);
        if (!count) return;
        rows.push({
          product_code: "__sg_band_" + String(band.label || rows.length),
          product_label: band.label || "",
          source_category: selectedCategory || "",
          price_krw: priceRangeMidpoint(band.min_price_krw, band.max_price_krw),
          __sg_min_price: Number(band.min_price_krw || 0) || 1,
          __sg_max_price: Number(band.max_price_krw || 0),
          __sg_weight: count
        });
      });
    }
    if (!rows.length) {
      const aggregateRows = (mode === "keyword" && selectedKeywords && selectedKeywords.length)
        ? keywordStatsRows(radar, selectedKeywords)
        : ((radar && radar.categories) || []);
      aggregateRows.forEach((row, index) => {
        const markers = rowPriceMarkers(row);
        const count = aggregateRowWeight(row);
        if (!markers.length || !count) return;
        rows.push({
          product_code: "__sg_agg_" + index,
          product_label: row && (row.keyword || row.source_category || ""),
          source_category: row && row.source_category || selectedCategory || "",
          price_krw: rowRepresentativePrice(row),
          __sg_min_price: Math.min.apply(null, markers),
          __sg_max_price: Math.max.apply(null, markers),
          __sg_weight: count
        });
      });
    }
    if (rows.length) return rows;
    let evidence = uniqueShoppingItems(((radar && radar.products) || []).concat((radar && radar.deal_candidates) || []));
    if (selectedCategory) evidence = evidence.filter((item) => itemMatchesCategory(item, selectedCategory));
    if (mode === "keyword" && selectedKeywords && selectedKeywords.length) {
      const keywordRowsForItems = keywordStatsRows(radar, selectedKeywords);
      const keywordItems = uniqueShoppingItems(keywordRowsForItems.reduce((items, row) => items.concat(keywordProducts(radar, row, 0)), []));
      if (keywordItems.length) evidence = keywordItems;
    }
    return evidence;
  }

  function optionHTML(value, label, selected) {
    return '<option value="' + esc(value) + '"' + (selected ? " selected" : "") + '>' + esc(label) + '</option>';
  }

  function statCard(title, value, sub) {
    return [
      '<div class="rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm">',
      '<div class="text-xs font-bold uppercase tracking-normal text-slate-500">' + esc(title) + '</div>',
      '<div class="mt-1 text-xl font-black text-slate-950">' + esc(value) + '</div>',
      sub ? '<div class="mx-auto mt-1 max-w-[14rem] text-xs leading-5 text-slate-500">' + esc(sub) + '</div>' : '',
      '</div>'
    ].join("");
  }

  function chartBox(id, title) {
    const lang = displayLang(routeLang());
    return [
      '<section data-chart-card class="min-w-[min(88vw,620px)] snap-start rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:min-w-[560px] xl:min-w-[620px]">',
      '<div class="mb-3 flex items-center justify-center gap-3 text-center">',
      '<h2 class="w-full text-center text-sm font-black text-slate-950">' + esc(title) + '</h2>',
      '</div>',
      '<div id="' + esc(id) + '" class="h-[300px] w-full rounded-lg bg-slate-50">' + chartFallbackHTML(lang, "chartPreparing") + '</div>',
      '</section>'
    ].join("");
  }

  function chartRailHTML(lang, boxes) {
    const rows = (boxes || []).filter(Boolean);
    if (!rows.length) return "";
    return [
      '<section class="relative" data-chart-rail data-chart-count="' + esc(rows.length) + '" style="--sg-chart-count:' + esc(rows.length) + '">',
      '<style>[data-chart-rail][data-chart-fit="1"] [data-chart-rail-track]{display:grid;grid-template-columns:repeat(var(--sg-chart-count),minmax(0,1fr));overflow:visible;scrollbar-width:auto}[data-chart-rail][data-chart-fit="1"] [data-chart-card]{min-width:0}</style>',
      '<div class="relative">',
      '<button type="button" data-chart-rail-prev class="absolute left-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950 text-xl font-black leading-none text-white shadow-lg hover:bg-slate-700" aria-label="' + esc(t(lang, "prevPage")) + '">&lt;</button>',
      '<button type="button" data-chart-rail-next class="absolute right-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950 text-xl font-black leading-none text-white shadow-lg hover:bg-slate-700" aria-label="' + esc(t(lang, "nextPage")) + '">&gt;</button>',
      '<div data-chart-rail-track class="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2" style="scrollbar-width:none">',
      rows.join(""),
      '</div>',
      '</div>',
      '</section>'
    ].join("");
  }

  function chartFallbackHTML(lang, titleKey, detailKey) {
    const title = t(lang, titleKey || "chartEmpty");
    const detail = t(lang, detailKey || "chartEmptyHint");
    return [
      '<div class="flex h-full items-center justify-center px-5 text-center">',
      '<div class="max-w-md">',
      '<div class="text-sm font-black text-slate-700">' + esc(title) + '</div>',
      detail ? '<p class="mt-2 text-xs font-bold leading-5 text-slate-500">' + esc(detail) + '</p>' : '',
      '</div>',
      '</div>'
    ].join("");
  }

  function emptyChart(el, lang, titleKey, detailKey) {
    if (!el) return;
    el.innerHTML = chartFallbackHTML(lang, titleKey || "chartEmpty", detailKey || "chartEmptyHint");
  }

  function renderSnapshot(lang, radar) {
    const s = radar && radar.summary ? radar.summary : {};
    return [
      '<section class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">',
      statCard(t(lang, "products"), number(s.product_count || 0), t(lang, "latest") + " " + (s.latest_collected_at || "-")),
      statCard(t(lang, "standardCategoriesLabel"), number(s.category_count || 0), t(lang, "standardCategoriesSub") + " · " + t(lang, "median") + " " + krw(s.median_price_krw || 0)),
      statCard(t(lang, "discounted"), number(s.discounted_count || 0), pct(s.discounted_percent || 0)),
      statCard(t(lang, "lowPrice"), number(s.low_price_count || 0), pct(s.low_price_percent || 0)),
      statCard(t(lang, "kpiCoverage"), number(s.history_product_runs || 0), t(lang, "kpiCoverageSub")),
      '</section>',
      '<section class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">',
      statCard(t(lang, "kpiPriceRange"), krw(s.min_price_krw || 0) + " - " + krw(s.max_price_krw || 0), t(lang, "kpiPriceRangeSub")),
      '</section>'
    ].join("");
  }

  function renderFinderForm(lang, radar) {
    const categories = categoryRows(radar).map((item) => item.source_category).filter(Boolean);
    const opts = [optionHTML("", t(lang, "allCategories"), true)].concat(categories.map((name) => optionHTML(name, name, false))).join("");
    return [
      '<section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">',
      '<form id="sg-shopping-finder-form" class="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]">',
      '<label class="block"><span class="text-xs font-black uppercase text-slate-500">' + esc(t(lang, "budget")) + '</span><input id="sg-shopping-budget" inputmode="numeric" class="mt-2 min-h-[44px] w-full rounded-lg border border-slate-300 px-4 text-sm" value="30000"></label>',
      '<label class="block"><span class="text-xs font-black uppercase text-slate-500">' + esc(t(lang, "category")) + '</span><select id="sg-shopping-category" class="mt-2 min-h-[44px] w-full rounded-lg border border-slate-300 px-4 text-sm">' + opts + '</select></label>',
      '<label class="block"><span class="text-xs font-black uppercase text-slate-500">' + esc(t(lang, "query")) + '</span><input id="sg-shopping-query" class="mt-2 min-h-[44px] w-full rounded-lg border border-slate-300 px-4 text-sm" placeholder="' + esc(t(lang, "queryPlaceholder")) + '"></label>',
      '<button class="mt-5 min-h-[44px] rounded-lg bg-slate-900 px-5 text-sm font-black text-white hover:bg-slate-700" type="submit">' + esc(t(lang, "analyze")) + '</button>',
      '<div class="lg:col-span-4">',
      '<div class="flex flex-wrap gap-2" id="sg-shopping-intents">',
      intentButton(lang, "budget", true),
      intentButton(lang, "gift", false),
      intentButton(lang, "daily", false),
      intentButton(lang, "seller", false),
      '</div>',
      '</div>',
      '</form>',
      '</section>'
    ].join("");
  }

  function categoryCard(lang, item, active) {
    const name = item && item.source_category ? String(item.source_category) : "-";
    return [
      '<button type="button" data-shopping-category="' + esc(name) + '" class="group flex h-full flex-col rounded-lg border p-4 text-left shadow-sm transition ' + (active ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50") + '">',
      '<div class="flex items-start justify-between gap-3">',
      '<h3 class="text-base font-black leading-6 text-slate-950">' + esc(name) + '</h3>',
      '<span class="rounded-full bg-white px-2 py-1 text-[11px] font-black text-blue-700 shadow-sm">' + esc(t(lang, "viewCategory")) + '</span>',
      '</div>',
      '<dl class="mt-4 grid gap-2 text-xs text-slate-600">',
      '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "products")) + '</dt><dd class="font-black text-right text-slate-950">' + esc(number(item && item.product_count || 0)) + '</dd></div>',
      '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "median")) + '</dt><dd class="font-black text-right text-slate-950">' + esc(krw(item && item.median_price_krw || 0)) + '</dd></div>',
      '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "lowPriceShare")) + '</dt><dd class="font-black text-right text-slate-950">' + esc(pct(item && item.low_price_percent || 0)) + '</dd></div>',
      '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "discount")) + '</dt><dd class="font-black text-right text-slate-950">' + esc(pct(item && item.discounted_percent || 0)) + '</dd></div>',
      '</dl>',
      '</button>'
    ].join("");
  }

  function renderCategoryDeck(lang, radar, selectedCategory) {
    const categories = categoryRows(radar);
    if (!categories.length) {
      return '<section class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">' + esc(t(lang, "chartEmpty")) + '</section>';
    }
    return [
      '<section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">',
      '<div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">',
      '<div>',
      '<h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "chooseCategory")) + '</h2>',
      '<p class="mt-2 max-w-3xl text-sm leading-6 text-slate-600">' + esc(t(lang, "categoryDeckDesc")) + '</p>',
      '</div>',
      '<span class="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">' + esc(t(lang, "categoryAllCharts")) + '</span>',
      '</div>',
      '<div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">',
      categories.map((item) => categoryCard(lang, item, selectedCategory && item.source_category === selectedCategory)).join(""),
      '</div>',
      '</section>'
    ].join("");
  }

  function renderCategoryResult(lang, finder, category) {
    if (!finder) {
      return '<section class="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">' + esc(t(lang, "categoryHint")) + '</section>';
    }
    const h = finder && finder.headline ? finder.headline : {};
    const title = category ? category + " · " + t(lang, "categoryProducts") : t(lang, "categoryProducts");
    return [
      '<section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">',
      '<div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">',
      '<div>',
      '<div class="text-xs font-black uppercase text-blue-700">' + esc(t(lang, "selectedCategory")) + '</div>',
      '<h2 class="mt-1 text-2xl font-black text-slate-950">' + esc(title) + '</h2>',
      '<p class="mt-2 text-sm leading-6 text-slate-600">' + esc(h.summary || "") + '</p>',
      '</div>',
      '<div class="grid grid-cols-2 gap-2 text-xs md:min-w-[300px]">',
      '<div class="rounded-lg bg-slate-50 p-3"><div class="font-bold text-slate-500">' + esc(t(lang, "products")) + '</div><div class="mt-1 font-black text-slate-950">' + esc(number(h.candidate_count || (finder.candidates || []).length || 0)) + '</div></div>',
      '<div class="rounded-lg bg-slate-50 p-3"><div class="font-bold text-slate-500">' + esc(t(lang, "confidence")) + '</div><div class="mt-1 font-black text-slate-950">' + esc(number(h.average_confidence_score || 0)) + '</div></div>',
      '</div>',
      '</div>',
      '</section>',
      '<div class="mt-6">',
      renderCandidates(lang, finder && finder.candidates),
      '</div>',
      '<div class="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.5fr]">',
      renderWatchlist(lang),
      renderPolicies(lang, finder && finder.policy_notes),
      '</div>'
    ].join("");
  }

  function score(value) {
    const n = Number(value || 0);
    if (!Number.isFinite(n)) return "0";
    return String(Math.round(n));
  }

  function scorePill(value) {
    const n = Number(value || 0);
    const tone = n >= 70 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : (n >= 45 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-600 border-slate-200");
    return '<span class="inline-flex min-w-[3.25rem] justify-end rounded-full border px-2 py-1 text-xs font-black ' + tone + '">' + esc(score(n)) + '</span>';
  }

  function metricCard(title, value, sub) {
    return [
      '<article class="rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm">',
      '<div class="text-xs font-black uppercase text-slate-500">' + esc(title) + '</div>',
      '<div class="mt-1 text-xl font-black text-slate-950">' + esc(value) + '</div>',
      sub ? '<p class="mx-auto mt-1 max-w-[14rem] text-xs leading-5 text-slate-500">' + esc(sub) + '</p>' : '',
      '</article>'
    ].join("");
  }

  function renderAnalysisModeSwitch(lang, activeMode) {
    const active = activeMode === "keyword" ? "keyword" : "category";
    function item(mode, label) {
      const isActive = active === mode;
      return '<a href="' + esc(modeHref(lang, mode)) + '" data-analysis-mode="' + esc(mode) + '" aria-current="' + (isActive ? "page" : "false") + '" class="inline-flex min-h-[38px] items-center justify-center rounded-lg px-4 text-sm font-black transition ' + (isActive ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-950") + '">' + esc(label) + '</a>';
    }
    return [
      '<section class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">',
      '<div class="text-xs font-black uppercase text-slate-500">' + esc(t(lang, "analysisMode")) + '</div>',
      '<div class="inline-flex w-fit rounded-lg border border-slate-200 bg-slate-100 p-1">',
      item("category", t(lang, "categoryMode")),
      item("keyword", t(lang, "keywordMode")),
      '</div>',
      '</section>'
    ].join("");
  }

  function stageHeaderHTML(lang, titleKey, descKey, meta) {
    const desc = descKey ? tOptional(lang, descKey) : "";
    return [
      '<div class="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">',
      '<div class="min-w-0">',
      '<div class="flex items-center gap-2">',
      '<span class="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-400"></span>',
      '<h2 class="text-lg font-black text-slate-900 md:text-xl">' + esc(t(lang, titleKey)) + '</h2>',
      '</div>',
      desc ? '<p class="mt-2 max-w-4xl text-sm leading-6 text-slate-600">' + esc(desc) + '</p>' : '',
      '</div>',
      meta ? '<span class="inline-flex w-fit rounded-full bg-white/80 px-3 py-1 text-xs font-black text-slate-600 shadow-sm ring-1 ring-slate-200/70">' + esc(meta) + '</span>' : '',
      '</div>'
    ].join("");
  }

  function stageToneClass(titleKey) {
    const tones = {
      categoryStageTitle: "bg-cyan-50/80",
      priceBandStageTitle: "bg-blue-50/75",
      marketStageTitle: "bg-emerald-50/70",
      keywordStageTitle: "bg-amber-50/70",
      segmentStageTitle: "bg-violet-50/70",
      evidenceStageTitle: "bg-slate-50"
    };
    return tones[titleKey] || "bg-slate-50";
  }

  function renderStage(lang, titleKey, descKey, body, meta) {
    if (!body) return "";
    return [
      '<section class="mb-8 rounded-lg px-3 py-4 md:px-5 md:py-5 ' + stageToneClass(titleKey) + '">',
      stageHeaderHTML(lang, titleKey, descKey, meta),
      body,
      '</section>'
    ].join("");
  }

  function renderAnalysisPath(lang, mode, selectedCategory, selectedKeywords) {
    return "";
    const keywordSelected = (selectedKeywords || []).length > 0;
    const selectedLabel = selectedCategory || (keywordSelected ? selectedKeywords.join(", ") : t(lang, "noSelectedLens"));
    const focused = keywordSelected || !!selectedCategory;
    const steps = [
      { key: "pathCategory", active: true },
      { key: "pathPrice", active: true },
      { key: "pathMarket", active: true },
      { key: "pathKeyword", active: mode === "keyword" || !!selectedCategory },
      { key: "pathSegment", active: focused },
      { key: "pathEvidence", active: focused }
    ];
    return [
      '<section class="mb-5 rounded-lg border border-slate-200 bg-white/85 px-3 py-2 shadow-sm">',
      '<div class="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">',
      '<div class="text-xs font-black text-slate-600">' + esc(t(lang, "analysisPath")) + ' · <span class="text-slate-950">' + esc(selectedLabel) + '</span></div>',
      '<div class="flex flex-wrap gap-1.5">',
      steps.map((step, index) => [
        '<span class="inline-flex min-h-[28px] items-center gap-1.5 rounded-full border px-2.5 py-1 ' + (step.active ? "border-blue-200 bg-blue-50 text-blue-800" : "border-slate-200 bg-slate-50 text-slate-500") + '">',
        '<span class="text-xs font-black leading-4">' + esc(t(lang, step.key)) + '</span>',
        '</span>'
      ].join("")).join(""),
      '</div>',
      '</div>',
      '</section>'
    ].join("");
  }

  function renderMarketOverviewStage(lang, radar, selectedCategory) {
    const searchQuery = activeKeywordSearchQuery(radar);
    const scoped = searchQuery ? searchQuery : (selectedCategory ? selectedCategory : t(lang, "allMarket"));
    if (isKeywordSearchLoading(radar)) {
      return renderStage(lang, "marketStageTitle", "marketStageDesc", renderKeywordSearchLoadingPanel(lang), scoped);
    }
    const body = [
      '<div class="grid grid-cols-1 gap-5">',
      renderMarketHero(lang, radar),
      renderChartsShell(lang, selectedCategory),
      '</div>'
    ].join("");
    return renderStage(lang, "marketStageTitle", "marketStageDesc", body, scoped);
  }

  function compactSignalBar(lang, labelKey, value, tone) {
    const n = Math.max(0, Math.min(100, Number(value || 0)));
    return [
      '<div>',
      '<div class="mb-1 flex items-center justify-between gap-2 text-[11px] font-bold text-slate-500">',
      '<span>' + esc(t(lang, labelKey)) + '</span>',
      '<span class="tabular-nums text-slate-700">' + esc(score(n)) + '</span>',
      '</div>',
      '<div class="h-1.5 overflow-hidden rounded-full bg-slate-100">',
      '<span class="block h-full rounded-full ' + tone + '" style="width:' + esc(Math.max(6, Math.round(n))) + '%"></span>',
      '</div>',
      '</div>'
    ].join("");
  }

  function categoryAxisTile(lang, item, active, rank) {
    const name = item && item.source_category ? item.source_category : "-";
    const attrs = 'data-category-card data-filter-text="' + esc([name, number(item && item.product_count || 0), krw(item && item.median_price_krw || 0)].join(" ")) + '" data-opportunity="' + esc(Number(item && item.opportunity_score || 0)) + '"';
    const button = [
      '<button type="submit" data-market-category="' + esc(name) + '" aria-label="' + esc(t(lang, "submitCategory") + " · " + name) + '" class="group flex min-h-[92px] w-full flex-col items-center justify-center rounded-lg border p-2 text-center transition focus:outline-none focus:ring-2 focus:ring-blue-300 ' + (active ? "border-slate-950 bg-slate-950 text-white shadow-md" : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50") + '">',
      '<span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full ' + (active ? "bg-white text-slate-950" : "bg-slate-100 text-slate-700 group-hover:bg-white group-hover:text-blue-700") + '">' + categoryIcon(name) + '</span>',
      '<h3 class="mt-2 line-clamp-2 min-h-[2rem] text-xs font-black leading-4 ' + (active ? "text-white" : "text-slate-950") + '">' + esc(name) + '</h3>',
      active ? '<span class="mt-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-black text-white">#' + esc(rank) + '</span>' : '',
      '</button>'
    ].join("");
    return postSelectionForm(lang, "category", name, button, "contents", attrs);
  }

  function allCategoryAxisTile(lang, active, rows) {
    const allCount = (rows || []).reduce((sum, row) => sum + Number(row && row.product_count || 0), 0);
    const attrs = 'data-category-card data-filter-text="' + esc([t(lang, "allView"), t(lang, "allMarket"), number(allCount)].join(" ")) + '" data-opportunity="0"';
    const button = [
      '<button type="submit" data-market-category="" aria-label="' + esc(t(lang, "allView")) + '" class="group flex min-h-[92px] w-full flex-col items-center justify-center rounded-lg border p-2 text-center transition focus:outline-none focus:ring-2 focus:ring-blue-300 ' + (active ? "border-slate-950 bg-slate-950 text-white shadow-md" : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50") + '">',
      '<span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full ' + (active ? "bg-white text-slate-950" : "bg-slate-100 text-slate-700 group-hover:bg-white group-hover:text-blue-700") + '">' + categoryIcon("") + '</span>',
      '<h3 class="mt-2 line-clamp-2 min-h-[2rem] text-xs font-black leading-4 ' + (active ? "text-white" : "text-slate-950") + '">' + esc(t(lang, "allView")) + '</h3>',
      '<span class="mt-1 rounded-full px-2 py-0.5 text-[10px] font-black ' + (active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500") + '">' + esc(number(allCount || 0)) + '</span>',
      '</button>'
    ].join("");
    return postSelectionForm(lang, "clear", "", button, "contents", attrs);
  }

  function renderCategoryAxisStage(lang, radar, selectedCategory, selectedSlugs) {
    const rows = categoryRows(radar);
    if (!rows.length) return "";
    const activeSlugs = uniqueCategorySlugs(selectedSlugs || (selectedCategory ? [selectedCategory] : []));
    const selectedSet = activeSlugs.reduce((acc, slug) => {
      acc[slug] = true;
      return acc;
    }, {});
    const meta = selectedCategory || (activeSlugs.length > 1 ? t(lang, "compareView") + " · " + number(activeSlugs.length) : "");
    const body = [
      '<div class="grid justify-center gap-2" style="grid-template-columns:repeat(auto-fit,minmax(92px,112px))">',
      allCategoryAxisTile(lang, !activeSlugs.length && !selectedCategory, rows),
      rows.map((item, index) => categoryAxisTile(lang, item, !!selectedSet[normalizedCategorySlug(item && item.source_category)], index + 1)).join(""),
      '</div>'
    ].join("");
    return renderStage(lang, "categoryStageTitle", "categoryStageDesc", body, meta);
  }

  function keywordAxisRows(radar, selectedCategory, selectedKeywords) {
    const selectedKeys = (selectedKeywords || []).map((keyword) => keywordKey(keyword)).filter(Boolean);
    let rows = selectedCategory
      ? scopedCategoryKeywordRows(radar, selectedCategory)
      : baseKeywordRows(radar);
    const searchQuery = activeKeywordSearchQuery(radar);
    if (searchQuery && !isKeywordSearchLoading(radar)) {
      rows = keywordSearchFocusedRows(radar, rows);
      if (!rows.length && selectedCategory) rows = keywordSearchFallbackRows(radar);
    }
    if (selectedKeys.length) {
      const selectedSet = selectedKeys.reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      rows = rows.filter((row) => selectedSet[keywordKey(row && row.keyword)]);
    }
    return rows
      .filter((row) => row && row.keyword)
      .map((row) => {
        const key = keywordKey(row.keyword);
        const info = keywordCategoryInfo(radar, {
          keyword: row.keyword,
          keyword_key: key,
          categories: row.categories || []
        });
        const labels = info.labels && info.labels.length ? info.labels : uniqueText(row.categories || []);
        return {
          keyword: row.keyword,
          keyword_key: key,
          product_count: Number(row.product_count || 0),
          category_count: Number(row.category_count || 0) || labels.length,
          categories: labels,
          p25_price_krw: Number(row.p25_price_krw || 0),
          median_price_krw: Number(row.median_price_krw || 0),
          p75_price_krw: Number(row.p75_price_krw || 0),
          demand_score: Number(row.demand_score || 0),
          competition_score: Number(row.competition_score || 0),
          opportunity_score: Number(row.opportunity_score || 0),
          interpretation: row.interpretation || ""
        };
      })
      .sort((a, b) => {
        const productDelta = Number(b.product_count || 0) - Number(a.product_count || 0);
        if (productDelta) return productDelta;
        return Number(b.opportunity_score || 0) - Number(a.opportunity_score || 0);
      })
      .slice(0, selectedKeys.length ? 8 : 160)
      .map((row, index) => Object.assign({}, row, { keyword_rank: index + 1 }));
  }

  function renderKeywordAxisStage(lang, radar, selectedCategory, selectedKeywords) {
    const rows = keywordAxisRows(radar, selectedCategory, selectedKeywords);
    if (!rows.length) return "";
    const selectedSet = (selectedKeywords || []).reduce((acc, keyword) => {
      const key = keywordKey(keyword);
      if (key) acc[key] = true;
      return acc;
    }, {});
    const meta = selectedCategory ? selectedCategory : (selectedKeywords && selectedKeywords.length ? selectedKeywords.join(", ") : t(lang, "keywordAxis"));
    const body = [
      '<div class="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">',
      '<form data-keyword-search-form class="grid grid-cols-[minmax(0,1fr)_auto] gap-2" autocomplete="off">',
      '<label class="block"><span class="sr-only">' + esc(t(lang, "keywordSearchPlaceholder")) + '</span><input type="search" data-keyword-filter class="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="' + esc(t(lang, "keywordSearchPlaceholder")) + '"></label>',
      '<button type="submit" data-keyword-search-button class="h-10 rounded-lg bg-slate-950 px-4 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">' + esc(t(lang, "keywordSearchButton")) + '</button>',
      '</form>',
      '<div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">',
      '<button type="button" data-keyword-filter-mode="all" aria-pressed="true" class="rounded-md bg-white px-3 py-2 text-xs font-black text-slate-900 shadow-sm">' + esc(t(lang, "filterAll")) + '</button>',
      '<button type="button" data-keyword-filter-mode="cross" aria-pressed="false" class="rounded-md px-3 py-2 text-xs font-black text-slate-500">' + esc(t(lang, "filterCrossCategory")) + '</button>',
      '<button type="button" data-keyword-filter-mode="opportunity" aria-pressed="false" class="rounded-md px-3 py-2 text-xs font-black text-slate-500">' + esc(t(lang, "filterOpportunity")) + '</button>',
      '</div>',
      '</div>',
      '<p class="mb-2 text-xs font-bold text-slate-500">' + esc(t(lang, "keywordPickHint")) + '</p>',
      '<div class="flex flex-wrap gap-2">',
      rows.map((row) => {
        const active = !!selectedSet[keywordKey(row.keyword)];
        const attrs = 'data-keyword-row data-keyword-rank="' + esc(row.keyword_rank || 0) + '" data-filter-text="' + esc([row.keyword, (row.categories || []).join(" "), krw(row.median_price_krw || 0)].join(" ")) + '" data-cross-category="' + (Number(row.category_count || 0) > 1 ? "1" : "0") + '" data-opportunity="' + esc(Number(row.opportunity_score || 0)) + '"';
        const crossBadge = Number(row.category_count || 0) > 1 ? '<span class="ml-1 h-1.5 w-1.5 rounded-full ' + (active ? "bg-white" : "bg-blue-500") + '"></span>' : '';
        const button = [
          '<button type="submit" data-top-keyword="' + esc(row.keyword || "") + '" aria-label="' + esc(t(lang, "submitKeyword") + " · " + (row.keyword || "")) + '" aria-pressed="' + (active ? "true" : "false") + '" class="inline-flex min-h-[34px] max-w-full items-center rounded-full border px-3 py-1.5 text-xs font-black transition focus:outline-none focus:ring-2 focus:ring-blue-300 ' + (active ? "border-slate-950 bg-slate-950 text-white shadow-sm" : "border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50") + '">',
          '<span class="min-w-0 truncate">#' + esc(row.keyword || "-") + '</span>',
          crossBadge,
          '</button>'
        ].join("");
        return postSelectionForm(lang, "keyword", row.keyword, button, "contents", attrs);
      }).join(""),
      '</div>',
    ].join("");
    return renderStage(lang, "keywordStageTitle", "keywordStageDesc", body, meta);
  }

  function renderSegmentStage(lang, radar, selectedCategory, selectedKeywords, mode) {
    let body = "";
    if (isKeywordSearchLoading(radar)) {
      return renderStage(lang, "segmentStageTitle", "segmentStageDesc", renderKeywordSearchLoadingPanel(lang), mode === "keyword" ? t(lang, "keywordAxis") : (selectedCategory || t(lang, "allMarket")));
    }
    if (mode === "keyword") {
      const rows = keywordStatsRows(radar, selectedKeywords);
      const categoryRowsForKeyword = keywordCategoryLensRows(radar, selectedKeywords);
      body = [
        '<div class="grid grid-cols-1 gap-6">',
        renderKeywordHero(lang, rows),
        renderKeywordChartsShell(lang),
        renderKeywordTable(lang, rows),
        renderKeywordCategoryLens(lang, radar, categoryRowsForKeyword),
        '</div>'
      ].join("");
    } else if (selectedCategory) {
      body = [
        '<div class="grid grid-cols-1 gap-6">',
        renderCategoryKeywordLens(lang, radar, selectedCategory),
        renderKeywordTableTabs(lang, [
          { key: "summary", label: t(lang, "keywordDiscovery"), html: renderKeywordDiscovery(lang, radar, selectedCategory) },
          { key: "analysis", label: t(lang, "keywordAnalysis"), html: renderCrossAnalysis(lang, radar, selectedCategory) },
          { key: "price", label: t(lang, "keywordPricePositioning"), html: renderPricePositioning(lang, radar, selectedCategory) }
        ]),
        '</div>'
      ].join("");
    } else {
      body = [
        '<div class="grid grid-cols-1 gap-6">',
        renderKeywordTableTabs(lang, [
          { key: "summary", label: t(lang, "keywordDiscovery"), html: renderKeywordDiscovery(lang, radar, "") },
          { key: "analysis", label: t(lang, "crossAnalysis"), html: renderCrossAnalysis(lang, radar, "") },
          { key: "price", label: t(lang, "pricePositioning"), html: renderPricePositioning(lang, radar, "") }
        ]),
        '</div>'
      ].join("");
    }
    const searchQuery = activeKeywordSearchQuery(radar);
    return renderStage(lang, "segmentStageTitle", "segmentStageDesc", body, mode === "keyword" ? t(lang, "keywordAxis") : (searchQuery || selectedCategory || t(lang, "allMarket")));
  }

  function renderEvidenceStage(lang, radar, selectedCategory, selectedKeywords, mode) {
    let body = "";
    const searchQuery = activeKeywordSearchQuery(radar);
    if (isKeywordSearchLoading(radar)) {
      return renderStage(lang, "evidenceStageTitle", "evidenceStageDesc", renderKeywordSearchLoadingPanel(lang), searchQuery || t(lang, "policies"));
    }
    if (mode === "keyword") {
      const rows = keywordStatsRows(radar, selectedKeywords);
      body = renderKeywordProducts(lang, radar, rows);
    } else {
      body = renderObservedProducts(lang, radar, selectedCategory);
    }
    body = [
      body,
      renderPolicies(lang, radar && radar.policy_notes)
    ].filter(Boolean).join('<div class="mt-6"></div>');
    return renderStage(lang, "evidenceStageTitle", "evidenceStageDesc", body, searchQuery || t(lang, "policies"));
  }

  function selectedPriceReferenceRow(radar, selectedCategory, selectedKeywords, mode) {
    if (mode === "keyword") {
      const rows = keywordStatsRows(radar, selectedKeywords);
      if (rows.length) return rows[0];
    }
    if (selectedCategory) {
      const slug = normalizedCategorySlug(selectedCategory);
      const row = categoryRows(radar).find((item) => normalizedCategorySlug(item && item.source_category) === slug);
      if (row) return row;
    }
    return radar && radar.summary ? radar.summary : {};
  }

  function priceRangeControlStyle() {
    return [
      '<style>',
      '.sg-price-range-input{position:absolute;left:0;right:0;top:0;width:100%;height:56px;margin:0;background:transparent;pointer-events:none;-webkit-appearance:none;appearance:none;}',
      '.sg-price-range-input[data-price-range-slider-min]{z-index:20;}',
      '.sg-price-range-input[data-price-range-slider-max]{z-index:30;}',
      '.sg-price-range-input::-webkit-slider-runnable-track{height:56px;background:transparent;}',
      '.sg-price-range-input::-moz-range-track{height:56px;background:transparent;}',
      '.sg-price-range-input::-webkit-slider-thumb{pointer-events:auto;-webkit-appearance:none;appearance:none;width:24px;height:24px;border-radius:9999px;border:4px solid #ffffff;background:#0f172a;box-shadow:0 8px 18px rgba(15,23,42,.22);cursor:grab;margin-top:16px;}',
      '.sg-price-range-input:active::-webkit-slider-thumb{cursor:grabbing;transform:scale(1.05);}',
      '.sg-price-range-input::-moz-range-thumb{pointer-events:auto;width:24px;height:24px;border-radius:9999px;border:4px solid #ffffff;background:#0f172a;box-shadow:0 8px 18px rgba(15,23,42,.22);cursor:grab;}',
      '.sg-price-range-input:focus-visible::-webkit-slider-thumb{outline:3px solid rgba(59,130,246,.35);outline-offset:2px;}',
      '.sg-price-range-input:focus-visible::-moz-range-thumb{outline:3px solid rgba(59,130,246,.35);outline-offset:2px;}',
      '</style>'
    ].join("");
  }

  function priceRangeDistributionHTML(lang, sourceItems) {
    const rows = (sourceItems || []).map((item) => {
      const count = aggregateRowWeight(item);
      const min = Number(item && item.__sg_min_price || 0);
      const max = Number(item && item.__sg_max_price || 0);
      if (!count || !Number.isFinite(min) || min <= 0 || !Number.isFinite(max) || max <= 0) return null;
      return {
        label: item && item.product_label ? String(item.product_label) : priceRangeLabel(lang, { min: min, max: max }),
        count: count
      };
    }).filter(Boolean);
    if (!rows.length) return "";
    const maxCount = rows.reduce((max, row) => Math.max(max, row.count), 0) || 1;
    return [
      '<div class="mt-3 rounded-lg bg-white/70 p-2">',
      '<div class="mb-1 text-[11px] font-black text-slate-500">' + esc(t(lang, "priceRangeDistribution")) + '</div>',
      '<div class="flex h-10 items-end gap-1" role="img" aria-label="' + esc(t(lang, "priceRangeDistribution")) + '">',
      rows.map((row) => {
        const height = Math.max(14, Math.round(100 * Math.sqrt(row.count / maxCount)));
        const title = row.label + " · " + number(row.count) + " " + t(lang, "products");
        return '<div class="flex flex-1 items-end overflow-hidden rounded bg-blue-50" title="' + esc(title) + '"><div class="w-full rounded-t bg-teal-600" style="height:' + esc(height) + '%"></div></div>';
      }).join(""),
      '</div>',
      '</div>'
    ].join("");
  }

  function renderPriceBandCriteriaStage(lang, radar, selectedCategory, selectedKeywords, mode) {
    const sourceItems = priceCriteriaItems(radar, selectedCategory, selectedKeywords, mode);
    const scope = selectedCategory || ((selectedKeywords || []).length ? selectedKeywords.join(", ") : t(lang, "allMarket"));
    const activeRange = currentPriceRange();
    const priceBoundaries = priceRangeBoundariesForItems(sourceItems);
    const slider = priceRangeSliderIndexes(activeRange, priceBoundaries);
    const selectedLabel = priceRangeLabel(lang, activeRange);
    const body = [
      '<section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" id="sg-shopping-price-range-slider" data-price-range-boundaries="' + esc(priceRangeBoundaryData(priceBoundaries)) + '">',
      priceRangeControlStyle(),
      '<div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h3 class="text-sm font-black text-slate-950">' + esc(t(lang, "absolutePriceBands")) + '</h3><p class="mt-1 text-xs font-bold text-slate-500">' + esc(t(lang, "priceRangeDragHint")) + '</p></div><span id="sg-shopping-price-band-status" class="inline-flex w-fit rounded-full bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-600">' + esc(t(lang, "priceBandSelected")) + ' · ' + esc(selectedLabel) + '</span></div>',
      '<div class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">',
      '<div class="flex items-center justify-between gap-3 text-xs font-black text-slate-500"><span>' + esc(t(lang, "priceRangeAll")) + '</span><span data-price-range-slider-label class="rounded-full bg-white px-3 py-1 text-slate-900 shadow-sm">' + esc(selectedLabel) + '</span></div>',
      '<div class="relative mt-4 h-14">',
      '<div class="absolute left-0 right-0 top-6 h-2 rounded-full bg-slate-200"></div>',
      '<div data-price-range-slider-track class="absolute top-6 h-2 rounded-full bg-blue-600" style="left:' + esc(priceRangeSliderPercent(slider.minIndex, priceBoundaries)) + '%;right:' + esc(100 - priceRangeSliderPercent(slider.maxIndex, priceBoundaries)) + '%"></div>',
      '<input type="range" min="0" max="' + esc(priceRangeSliderMaxIndex(priceBoundaries)) + '" step="1" value="' + esc(slider.minIndex) + '" data-price-range-slider-min aria-label="' + esc(t(lang, "priceRangeMin")) + '" class="sg-price-range-input z-20">',
      '<input type="range" min="0" max="' + esc(priceRangeSliderMaxIndex(priceBoundaries)) + '" step="1" value="' + esc(slider.maxIndex) + '" data-price-range-slider-max aria-label="' + esc(t(lang, "priceRangeMax")) + '" class="sg-price-range-input z-30">',
      '</div>',
      priceRangeDistributionHTML(lang, sourceItems),
      '<div class="flex justify-between gap-2 text-[11px] font-black text-slate-500">',
      priceRangeBoundaryTicksHTML(priceBoundaries),
      '</div>',
      '<div class="mt-4 rounded-lg border border-slate-200 bg-white p-3">',
      '<div class="mb-2 flex items-center justify-between gap-2"><span class="text-xs font-black uppercase text-slate-500">' + esc(t(lang, "priceRangeManual")) + '</span><span class="inline-flex max-w-[55%] truncate rounded-full bg-white px-2 py-1 text-[11px] font-black text-slate-600">' + esc(t(lang, "priceBandScope")) + ' · ' + esc(scope) + '</span></div>',
      '<div class="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">',
      '<label class="block"><span class="text-xs font-black text-slate-500">' + esc(t(lang, "priceRangeMin")) + '</span><input type="number" min="0" step="100" inputmode="numeric" data-price-range-min class="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-black text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="0"></label>',
      '<label class="block"><span class="text-xs font-black text-slate-500">' + esc(t(lang, "priceRangeMax")) + '</span><input type="number" min="0" step="100" inputmode="numeric" data-price-range-max class="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-black text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="' + esc(priceBoundaries[priceBoundaries.length - 1] || 0) + '"></label>',
      '<button type="button" data-price-range-clear class="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-700 hover:border-slate-400 hover:bg-white">' + esc(t(lang, "priceRangeClear")) + '</button>',
      '</div>',
      '</div>',
      '</div>',
      '<p class="mt-3 text-xs font-bold leading-5 text-slate-500">' + esc(t(lang, "priceBandUse")) + '</p>',
      '</section>'
    ].join("");
    return renderStage(lang, "priceBandStageTitle", "priceBandStageDesc", body, scope);
  }

  function renderMarketHero(lang, radar) {
    const s = radar && radar.summary ? radar.summary : {};
    return [
      '<section class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">',
      metricCard(t(lang, "products"), number(s.product_count || 0), t(lang, "latest") + " " + (s.latest_collected_at || "-")),
      metricCard(t(lang, "standardCategoriesLabel"), number(s.category_count || 0), t(lang, "standardCategoriesSub") + " · " + t(lang, "median") + " " + krw(s.median_price_krw || 0)),
      metricCard(t(lang, "discounted"), pct(s.discounted_percent || 0), number(s.discounted_count || 0) + " " + t(lang, "products")),
      metricCard(t(lang, "lowPrice"), pct(s.low_price_percent || 0), number(s.low_price_count || 0) + " " + t(lang, "products")),
      '</section>'
    ].join("");
  }

  function categoryRows(radar) {
    return normalizeCategoryBenchmarkRows((radar && (radar.category_options || radar.categories)) || [])
      .sort((a, b) => Number(b.product_count || 0) - Number(a.product_count || 0))
      .slice(0, STANDARD_CATEGORIES.length);
  }

  function weightedMeanValue(sum, weight) {
    return weight > 0 ? Math.round(sum / weight) : 0;
  }

  function ratioPercent(part, total) {
    const n = Number(total || 0);
    if (!n) return 0;
    return Math.round((10000 * Number(part || 0)) / n) / 100;
  }

  function normalizeCategoryBenchmarkRows(rows) {
    const buckets = {};
    (rows || []).forEach((item) => {
      if (!item || !item.source_category) return;
      const standard = standardCategoryName(item.source_category);
      if (!standard) return;
      const weight = Math.max(1, Number(item.product_count || 0));
      if (!buckets[standard]) {
        buckets[standard] = {
          row: {
            source_category: standard,
            product_count: 0,
            seller_count: 0,
            brand_count: 0,
            review_sum: 0,
            order_sum: 0,
            discounted_count: 0,
            low_price_count: 0,
            min_price_krw: 0,
            max_price_krw: 0,
            latest_collected_at: "",
            interpretation: item.interpretation || ""
          },
          weight: 0,
          p25: 0,
          p50: 0,
          p75: 0,
          demand: 0,
          competition: 0,
          priceGap: 0,
          opportunity: 0
        };
      }
      const bucket = buckets[standard];
      const row = bucket.row;
      row.product_count += Number(item.product_count || 0);
      row.seller_count += Number(item.seller_count || 0);
      row.brand_count += Number(item.brand_count || 0);
      row.review_sum += Number(item.review_sum || 0);
      row.order_sum += Number(item.order_sum || 0);
      row.discounted_count += Number(item.discounted_count || 0);
      row.low_price_count += Number(item.low_price_count || 0);
      const minPrice = Number(item.min_price_krw || 0);
      const maxPrice = Number(item.max_price_krw || 0);
      if (minPrice > 0 && (!row.min_price_krw || minPrice < row.min_price_krw)) row.min_price_krw = minPrice;
      if (maxPrice > row.max_price_krw) row.max_price_krw = maxPrice;
      if (String(item.latest_collected_at || "") > String(row.latest_collected_at || "")) row.latest_collected_at = item.latest_collected_at;
      bucket.p25 += Number(item.p25_price_krw || 0) * weight;
      bucket.p50 += Number(item.median_price_krw || 0) * weight;
      bucket.p75 += Number(item.p75_price_krw || 0) * weight;
      bucket.demand += Number(item.demand_score || 0) * weight;
      bucket.competition += Number(item.competition_score || 0) * weight;
      bucket.priceGap += Number(item.price_gap_score || 0) * weight;
      bucket.opportunity += Number(item.opportunity_score || 0) * weight;
      bucket.weight += weight;
    });
    return STANDARD_CATEGORIES.map((standard) => {
      const bucket = buckets[standard];
      if (!bucket || Number(bucket.row.product_count || 0) <= 0) return null;
      const row = bucket.row;
      row.p25_price_krw = weightedMeanValue(bucket.p25, bucket.weight);
      row.median_price_krw = weightedMeanValue(bucket.p50, bucket.weight);
      row.p75_price_krw = weightedMeanValue(bucket.p75, bucket.weight);
      row.iqr_price_krw = Math.max(0, Number(row.p75_price_krw || 0) - Number(row.p25_price_krw || 0));
      row.discounted_percent = ratioPercent(row.discounted_count, row.product_count);
      row.low_price_percent = ratioPercent(row.low_price_count, row.product_count);
      row.demand_score = weightedMeanValue(bucket.demand, bucket.weight);
      row.competition_score = weightedMeanValue(bucket.competition, bucket.weight);
      row.price_gap_score = weightedMeanValue(bucket.priceGap, bucket.weight);
      row.opportunity_score = weightedMeanValue(bucket.opportunity, bucket.weight);
      return row;
    }).filter(Boolean);
  }

  function iconSVG(paths) {
    return '<svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">' + paths + '</svg>';
  }

  function categoryIcon(name) {
    const raw = String(name || "").toLowerCase();
    if (!raw) {
      return iconSVG('<path stroke-width="2" d="M4 4h7v7H4z"></path><path stroke-width="2" d="M13 4h7v7h-7z"></path><path stroke-width="2" d="M4 13h7v7H4z"></path><path stroke-width="2" d="M13 13h7v7h-7z"></path>');
    }
    if (raw.includes("가공") || raw.includes("식품") || raw.includes("푸드") || raw.includes("food")) {
      return iconSVG('<path stroke-width="2" d="M5 11h14"></path><path stroke-width="2" d="M7 11c0 4 2 7 5 7s5-3 5-7"></path><path stroke-width="2" d="M9 7c0-1.5 1-2.5 3-3"></path><path stroke-width="2" d="M14 7c0-1.5 1-2.5 3-3"></path>');
    }
    if (raw.includes("생활") || raw.includes("주방") || raw.includes("kitchen") || raw.includes("living")) {
      return iconSVG('<path stroke-width="2" d="M4 11l8-7 8 7"></path><path stroke-width="2" d="M6 10v9h12v-9"></path><path stroke-width="2" d="M10 19v-5h4v5"></path>');
    }
    if (raw.includes("도서") || raw.includes("음반") || raw.includes("book") || raw.includes("music")) {
      return iconSVG('<path stroke-width="2" d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21z"></path><path stroke-width="2" d="M9 7h6"></path><path stroke-width="2" d="M9 10h5"></path><path stroke-width="2" d="M17 7v7"></path><path stroke-width="2" d="M17 14a2 2 0 1 1-2-2"></path>');
    }
    if (raw.includes("뷰티") || raw.includes("화장") || raw.includes("beauty")) {
      return iconSVG('<path stroke-width="2" d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"></path><path stroke-width="2" d="M18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9z"></path>');
    }
    if (raw.includes("쿠폰") || raw.includes("coupon") || raw.includes("ticket")) {
      return iconSVG('<path stroke-width="2" d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"></path><path stroke-width="2" d="M9 9h.01M15 15h.01M15 9l-6 6"></path>');
    }
    if (raw.includes("가구") || raw.includes("furniture")) {
      return iconSVG('<path stroke-width="2" d="M5 11h14v5H5z"></path><path stroke-width="2" d="M7 11V8a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v3"></path><path stroke-width="2" d="M7 16v3M17 16v3"></path>');
    }
    if (raw.includes("패션") || raw.includes("의류") || raw.includes("신발") || raw.includes("fashion")) {
      return iconSVG('<path stroke-width="2" d="M8 4l4 2 4-2 3 4-3 2v10H8V10L5 8z"></path><path stroke-width="2" d="M10 6c.5 1 1.2 1.5 2 1.5S13.5 7 14 6"></path>');
    }
    if (raw.includes("디지털") || raw.includes("가전") || raw.includes("컴퓨터") || raw.includes("digital")) {
      return iconSVG('<path stroke-width="2" d="M5 5h14v10H5z"></path><path stroke-width="2" d="M9 19h6"></path><path stroke-width="2" d="M12 15v4"></path>');
    }
    if (raw.includes("스포츠") || raw.includes("레저") || raw.includes("sports")) {
      return iconSVG('<path stroke-width="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path><path stroke-width="2" d="M4.8 8.5c3 .2 5.5 2.7 5.7 5.7"></path><path stroke-width="2" d="M13.5 3.3c.2 3 2.7 5.5 5.7 5.7"></path>');
    }
    if (raw.includes("유아") || raw.includes("출산") || raw.includes("키즈") || raw.includes("baby")) {
      return iconSVG('<path stroke-width="2" d="M7 10h10l-1 9H8z"></path><path stroke-width="2" d="M9 10a3 3 0 0 1 6 0"></path><path stroke-width="2" d="M10 14h.01M14 14h.01"></path>');
    }
    if (raw.includes("반려") || raw.includes("펫") || raw.includes("pet")) {
      return iconSVG('<path stroke-width="2" d="M8 11c-2 0-3 1.5-3 3.2C5 16 6.4 17 8 17h8c1.6 0 3-1 3-2.8C19 12.5 18 11 16 11c-1.2 0-2 .5-4 2-2-1.5-2.8-2-4-2z"></path><path stroke-width="2" d="M7 8h.01M10 6h.01M14 6h.01M17 8h.01"></path>');
    }
    if (raw.includes("자동차") || raw.includes("car")) {
      return iconSVG('<path stroke-width="2" d="M5 13l2-5h10l2 5"></path><path stroke-width="2" d="M4 13h16v5H4z"></path><path stroke-width="2" d="M7 18v2M17 18v2M7 15h.01M17 15h.01"></path>');
    }
    if (raw.includes("문구") || raw.includes("office") || raw.includes("stationery")) {
      return iconSVG('<path stroke-width="2" d="M4 20l4-1 10-10-3-3L5 16z"></path><path stroke-width="2" d="M13 8l3 3"></path><path stroke-width="2" d="M16 5l3 3"></path>');
    }
    return iconSVG('<path stroke-width="2" d="M4 7a3 3 0 0 1 3-3h4l9 9-7 7-9-9z"></path><path stroke-width="2" d="M8 8h.01"></path>');
  }

  function categoryTabHTML(lang, value, title, sub, active, selectedCount) {
    const slug = normalizedCategorySlug(value || "");
    const href = value ? categoryHref(lang, value || "") : shoppingBasePath(lang);
    const marker = value && active ? '<span class="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-[11px] font-black text-white">' + esc(selectedCount || 1) + '</span>' : '';
    return [
      '<a href="' + esc(href) + '" data-top-category="' + esc(value || "") + '" data-category-slug="' + esc(slug) + '" aria-current="' + (active ? "page" : "false") + '" aria-pressed="' + (active ? "true" : "false") + '" class="group flex min-w-0 flex-col items-center gap-2 rounded-lg px-1.5 py-2 text-center transition focus:outline-none focus:ring-2 focus:ring-blue-300">',
      '<span class="relative flex h-16 w-16 items-center justify-center rounded-full border transition ' + (active ? "border-slate-950 bg-slate-950 text-white shadow-md" : "border-slate-200 bg-white text-slate-700 shadow-sm group-hover:border-blue-300 group-hover:bg-blue-50 group-hover:text-blue-700") + '">',
      categoryIcon(value || ""),
      marker,
      '</span>',
      '<span class="block min-h-[40px] w-full text-sm font-black leading-5 ' + (active ? "text-slate-950" : "text-slate-700") + '">' + esc(title || "-") + '</span>',
      sub ? '<span class="block w-full text-[11px] font-bold leading-4 text-slate-500">' + esc(sub) + '</span>' : '',
      '</a>'
    ].join("");
  }

  function renderTopCategoryNav(lang, radar, selectedCategory, selectedSlugs) {
    const rows = categoryRows(radar);
    if (!rows.length) return "";
    const allCount = rows.reduce((sum, row) => sum + Number(row.product_count || 0), 0);
    const allSub = number(allCount || 0) + " " + t(lang, "products") + " · " + number(rows.length) + " " + t(lang, "categoriesLabel");
    const activeSlugs = uniqueCategorySlugs(selectedSlugs || (selectedCategory ? [selectedCategory] : []));
    const selectedSet = activeSlugs.reduce((acc, slug) => {
      acc[slug] = true;
      return acc;
    }, {});
    const statusLabel = activeSlugs.length > 1
      ? t(lang, "compareView") + " · " + number(activeSlugs.length) + " " + t(lang, "selectedCount")
      : (selectedCategory || t(lang, "allView"));
    return [
      '<section class="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "topCategories")) + '</h2>',
      '<span class="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">' + esc(t(lang, "currentView")) + ' · ' + esc(statusLabel) + '</span>',
      '</div>',
      '<div class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">',
      categoryTabHTML(lang, "", t(lang, "allView"), allSub, !activeSlugs.length, ""),
      rows.map((item, index) => {
        const slug = normalizedCategorySlug(item.source_category || "");
        return categoryTabHTML(lang, item.source_category, item.source_category, number(item.product_count || 0) + " " + t(lang, "products") + " · " + t(lang, "p50") + " " + krw(item.median_price_krw || 0), !!selectedSet[slug], activeSlugs.indexOf(slug) + 1 || index + 1);
      }).join(""),
      '</div>',
      '</section>'
    ].join("");
  }

  function baseKeywordRows(radar) {
    const rows = ((radar && radar.keywords) || [])
      .filter(visibleKeywordRow)
      .slice()
      .sort((a, b) => {
        const productDelta = Number(b.product_count || 0) - Number(a.product_count || 0);
        if (productDelta) return productDelta;
        return Number(b.opportunity_score || 0) - Number(a.opportunity_score || 0);
      });
    return activeKeywordSearchQuery(radar) && !isKeywordSearchLoading(radar) ? keywordSearchFocusedRows(radar, rows) : rows;
  }

  function keywordDisplayMap(radar) {
    const map = {};
    baseKeywordRows(radar).forEach((row) => {
      const key = keywordKey(row.keyword);
      if (key && !map[key]) map[key] = row.keyword;
    });
    ((radar && radar.category_keywords) || []).forEach((row) => {
      if (!visibleKeywordRow(row)) return;
      const key = keywordKey(row && row.keyword);
      if (key && !map[key]) map[key] = row.keyword;
    });
    return map;
  }

  function keywordTabHTML(lang, keyword, sub, active, selectedCount) {
    const key = keywordKey(keyword);
    const marker = active ? '<span class="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-[11px] font-black text-white">' + esc(selectedCount || 1) + '</span>' : '';
    return [
      '<a href="' + esc(keywordHref(lang, active ? selectedKeywordsFromURL().filter((item) => keywordKey(item) !== key) : selectedKeywordsFromURL().concat([keyword]))) + '" data-top-keyword="' + esc(keyword || "") + '" data-keyword-key="' + esc(key) + '" aria-pressed="' + (active ? "true" : "false") + '" class="group flex min-w-0 flex-col items-center gap-2 rounded-lg px-1.5 py-2 text-center transition focus:outline-none focus:ring-2 focus:ring-blue-300">',
      '<span class="relative flex h-16 w-16 items-center justify-center rounded-full border text-xl font-black transition ' + (active ? "border-slate-950 bg-slate-950 text-white shadow-md" : "border-slate-200 bg-white text-slate-700 shadow-sm group-hover:border-blue-300 group-hover:bg-blue-50 group-hover:text-blue-700") + '">',
      '#',
      marker,
      '</span>',
      '<span class="block min-h-[40px] w-full text-sm font-black leading-5 ' + (active ? "text-slate-950" : "text-slate-700") + '">' + esc(keyword || "-") + '</span>',
      sub ? '<span class="block w-full text-[11px] font-bold leading-4 text-slate-500">' + esc(sub) + '</span>' : '',
      '</a>'
    ].join("");
  }

  function renderTopKeywordNav(lang, radar, selectedKeywords) {
    const rows = baseKeywordRows(radar).slice(0, 24);
    if (!rows.length) return "";
    const selected = (selectedKeywords || []).filter(Boolean);
    const selectedSet = selected.reduce((acc, keyword) => {
      const key = keywordKey(keyword);
      if (key) acc[key] = true;
      return acc;
    }, {});
    const statusLabel = selected.length
      ? t(lang, "keywordView") + " · " + number(selected.length) + " " + t(lang, "selectedCount")
      : t(lang, "keywordView");
    const totalProducts = rows.reduce((sum, row) => sum + Number(row.product_count || 0), 0);
    return [
      '<section class="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "keywordSelection")) + '</h2>',
      '<span class="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">' + esc(t(lang, "currentView")) + ' · ' + esc(statusLabel) + '</span>',
      '</div>',
      '<div class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">',
      '<a href="' + esc(keywordHref(lang, [])) + '" data-clear-keywords="1" aria-current="' + (!selected.length ? "page" : "false") + '" class="group flex min-w-0 flex-col items-center gap-2 rounded-lg px-1.5 py-2 text-center transition focus:outline-none focus:ring-2 focus:ring-blue-300">',
      '<span class="flex h-16 w-16 items-center justify-center rounded-full border transition ' + (!selected.length ? "border-slate-950 bg-slate-950 text-white shadow-md" : "border-slate-200 bg-white text-slate-700 shadow-sm group-hover:border-blue-300 group-hover:bg-blue-50 group-hover:text-blue-700") + '">' + categoryIcon("") + '</span>',
      '<span class="block min-h-[40px] w-full text-sm font-black leading-5 ' + (!selected.length ? "text-slate-950" : "text-slate-700") + '">' + esc(t(lang, "allView")) + '</span>',
      '<span class="block w-full text-[11px] font-bold leading-4 text-slate-500">' + esc(number(totalProducts || 0) + " " + t(lang, "products")) + '</span>',
      '</a>',
      rows.map((row) => {
        const key = keywordKey(row.keyword);
        const active = !!selectedSet[key];
        const sub = number(row.product_count || 0) + " " + t(lang, "products") + " · " + number(row.category_count || 0) + " " + t(lang, "categoriesLabel");
        return keywordTabHTML(lang, row.keyword, sub, active, selected.map((item) => keywordKey(item)).indexOf(key) + 1 || 1);
      }).join(""),
      '</div>',
      '</section>'
    ].join("");
  }

  function renderCategoryMarketMap(lang, radar, selectedCategory) {
    if (selectedCategory) return "";
    const rows = categoryRows(radar).slice().sort((a, b) => {
      const productDelta = Number(b.product_count || 0) - Number(a.product_count || 0);
      if (productDelta) return productDelta;
      return Number(b.opportunity_score || 0) - Number(a.opportunity_score || 0);
    });
    if (!rows.length) return "";
    function miniBar(label, value, tone) {
      const n = Math.max(0, Math.min(100, Number(value || 0)));
      const width = Math.max(6, Math.round(n));
      return [
        '<div>',
        '<div class="mb-1 flex items-center justify-between gap-2 text-[11px] font-bold text-slate-500">',
        '<span>' + esc(label) + '</span>',
        '<span class="tabular-nums text-slate-700">' + esc(score(n)) + '</span>',
        '</div>',
        '<div class="h-1.5 overflow-hidden rounded-full bg-slate-100">',
        '<span class="block h-full rounded-full ' + tone + '" style="width:' + esc(width) + '%"></span>',
        '</div>',
        '</div>'
      ].join("");
    }
    return [
      '<section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">',
      '<div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">',
      '<div><h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "marketMap")) + '</h2><p class="mt-2 text-sm leading-6 text-slate-600">' + esc(t(lang, "selectCategoryInsight")) + '</p></div>',
      '<span class="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">' + esc(selectedCategory || t(lang, "allMarket")) + '</span>',
      '</div>',
      '<div class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">',
      rows.map((item) => {
        const name = item.source_category || "-";
        const active = selectedCategory && selectedCategory === name;
        return [
          '<a href="' + esc(categoryHref(lang, name)) + '" data-market-category="' + esc(name) + '" class="group flex min-h-[168px] flex-col rounded-lg border p-3 text-left transition ' + (active ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50") + '">',
          '<div class="flex items-start justify-between gap-2">',
          '<span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 group-hover:bg-white group-hover:text-blue-700">' + categoryIcon(name) + '</span>',
          scorePill(item.opportunity_score),
          '</div>',
          '<h3 class="mt-3 line-clamp-2 min-h-[2.5rem] text-sm font-black leading-5 text-slate-950">' + esc(name) + '</h3>',
          '<div class="mt-2 flex items-center justify-between gap-2 text-[11px] font-bold text-slate-500">',
          '<span>' + esc(number(item.product_count || 0)) + ' ' + esc(t(lang, "products")) + '</span>',
          '<span class="text-right tabular-nums text-slate-700">' + esc(krw(item.median_price_krw || 0)) + '</span>',
          '</div>',
          '<div class="mt-3 grid gap-2">',
          miniBar(t(lang, "metricDemand"), item.demand_score, "bg-blue-600"),
          miniBar(t(lang, "metricCompetition"), item.competition_score, "bg-amber-500"),
          miniBar(t(lang, "metricOpportunity"), item.opportunity_score, "bg-emerald-600"),
          '</div>',
          '</a>'
        ].join("");
      }).join(""),
      '</div>',
      '</section>'
    ].join("");
  }

  function scopedCategoryKeywordRows(radar, selectedCategory) {
    const rows = ((radar && radar.category_keywords) || []).filter(visibleKeywordRow);
    if (!selectedCategory) return rows;
    const scoped = radar && radar.scope_category ? String(radar.scope_category) : "";
    if (scoped && categorySlug(scoped) === categorySlug(selectedCategory)) return rows;
    const selectedSlug = categorySlug(selectedCategory);
    return rows.filter((item) => categorySlug(item.source_category || "") === selectedSlug);
  }

  function activeKeywordSearchQuery(radar) {
    return String(radar && radar.__sg_keyword_search_query || "").trim();
  }

  function isKeywordSearchLoading(radar) {
    return !!(radar && radar.__sg_keyword_search_loading);
  }

  function renderKeywordSearchLoadingPanel(lang) {
    return [
      '<section class="rounded-lg border border-blue-100 bg-white p-6 text-center shadow-sm">',
      '<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">',
      '<span class="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700"></span>',
      '</div>',
      '<h3 class="mt-4 text-base font-black text-slate-950">' + esc(t(lang, "keywordSearchLoadingTitle")) + '</h3>',
      '<p class="mx-auto mt-2 max-w-xl text-sm font-bold leading-6 text-slate-500">' + esc(t(lang, "keywordSearchLoadingDetail")) + '</p>',
      '<div class="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-3">',
      '<span class="h-3 rounded-full bg-slate-100"></span>',
      '<span class="h-3 rounded-full bg-slate-100"></span>',
      '<span class="h-3 rounded-full bg-slate-100"></span>',
      '</div>',
      '</section>'
    ].join("");
  }

  function renderPriceEvidenceLoadingPanel(lang) {
    return [
      '<section class="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center shadow-sm">',
      '<div class="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-50">',
      '<span class="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900"></span>',
      '</div>',
      '<h3 class="mt-4 text-sm font-black text-slate-950">' + esc(t(lang, "priceEvidenceLoadingTitle")) + '</h3>',
      '<p class="mx-auto mt-2 max-w-xl text-xs font-bold leading-5 text-slate-500">' + esc(t(lang, "priceEvidenceLoadingDetail")) + '</p>',
      '<div class="mx-auto mt-5 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">',
      '<span class="h-24 rounded-lg bg-slate-50"></span>',
      '<span class="h-24 rounded-lg bg-slate-50"></span>',
      '<span class="h-24 rounded-lg bg-slate-50"></span>',
      '</div>',
      '</section>'
    ].join("");
  }

  function keywordRowMatchesSearchQuery(row, query) {
    const key = keywordKey(row && row.keyword);
    const q = keywordKey(query);
    if (!q) return false;
    if (key && (key === q || key.indexOf(q) >= 0 || q.indexOf(key) >= 0)) return true;
    return keywordSearchTextMatches(keywordRowSearchText(row), query);
  }

  function productMatchesSearchQuery(item, query) {
    return keywordSearchTextMatches(productSearchText(item), query);
  }

  function sortKeywordSearchRows(rows) {
    return (rows || []).slice().sort((a, b) => {
      const rankA = Number(a && a.__sg_keyword_search_rank || 0) || 999999;
      const rankB = Number(b && b.__sg_keyword_search_rank || 0) || 999999;
      if (rankA !== rankB) return rankA - rankB;
      const opportunity = Number(b && b.opportunity_score || 0) - Number(a && a.opportunity_score || 0);
      if (opportunity) return opportunity;
      return Number(b && b.product_count || 0) - Number(a && a.product_count || 0);
    });
  }

  function keywordSearchFocusedRows(radar, rows) {
    const query = activeKeywordSearchQuery(radar);
    if (!query) return (rows || []).slice();
    const tagged = (rows || []).filter((row) => String(row && row.__sg_keyword_search_query || "") === query);
    const direct = tagged.filter((row) => keywordRowMatchesSearchQuery(row, query));
    if (direct.length) return sortKeywordSearchRows(direct);
    const textMatched = (rows || []).filter((row) => keywordRowMatchesSearchQuery(row, query));
    if (textMatched.length) return sortKeywordSearchRows(textMatched);
    return [];
  }

  function keywordSearchFallbackRows(radar) {
    return keywordSearchFocusedRows(radar, ((radar && radar.keywords) || []).concat((radar && radar.category_keywords) || []).filter(visibleKeywordRow));
  }

  function keywordSearchSummaryRow(lang, radar, query, selectedCategory) {
    const products = uniqueShoppingItems(((radar && radar.products) || []).concat((radar && radar.deal_candidates) || []))
      .filter((item) => productMatchesSearchQuery(item, query));
    const sourceRows = ((radar && radar.keywords) || []).concat((radar && radar.category_keywords) || [])
      .filter((row) => String(row && row.__sg_keyword_search_query || "") === query);
    if (!products.length) return null;
    const categories = uniqueText(products.map((item) => item && item.source_category).concat(sourceRows.map((row) => row && row.source_category)).filter(Boolean));
    function avg(field, fallback) {
      const vals = sourceRows.map((row) => Number(row && row[field] || 0)).filter((value) => Number.isFinite(value) && value > 0);
      if (!vals.length) return fallback;
      return Math.round(vals.reduce((sum, value) => sum + value, 0) / vals.length);
    }
    return {
      keyword: query,
      product_count: products.length,
      category_count: selectedCategory ? 1 : (categories.length || sourceRows.reduce((max, row) => Math.max(max, Number(row && row.category_count || 0)), 0)),
      demand_score: avg("demand_score", products.length ? 100 : 0),
      competition_score: avg("competition_score", 0),
      opportunity_score: avg("opportunity_score", 0),
      interpretation: t(lang, "keywordSearchSummaryInterpretation"),
      __sg_keyword_search_query: query,
      __sg_keyword_search_rank: 0
    };
  }

  function renderKeywordDiscovery(lang, radar, selectedCategory) {
    const scopedRows = scopedCategoryKeywordRows(radar, selectedCategory);
    let rows = selectedCategory
      ? scopedRows
        .map((item) => ({
          keyword: item.keyword,
          product_count: item.product_count,
          category_count: item.category_count || 1,
          source_category: item.source_category || selectedCategory,
          demand_score: item.demand_score,
          competition_score: item.competition_score,
          opportunity_score: item.opportunity_score,
          interpretation: item.interpretation,
          __sg_keyword_search_query: item.__sg_keyword_search_query,
          __sg_keyword_search_rank: item.__sg_keyword_search_rank
        }))
      : ((radar && radar.keywords) || []).filter(visibleKeywordRow);
    const searchQuery = activeKeywordSearchQuery(radar);
    if (selectedCategory && !rows.length && !searchQuery) rows = ((radar && radar.keywords) || []).filter(visibleKeywordRow);
    if (searchQuery) {
      rows = keywordSearchFocusedRows(radar, rows);
      if (!rows.length && selectedCategory) {
        rows = keywordSearchFallbackRows(radar).map((item) => ({
          keyword: item.keyword,
          product_count: item.product_count,
          category_count: item.category_count || (item.source_category ? 1 : 0),
          source_category: item.source_category || "",
          demand_score: item.demand_score,
          competition_score: item.competition_score,
          opportunity_score: item.opportunity_score,
          interpretation: item.interpretation,
          __sg_keyword_search_query: item.__sg_keyword_search_query,
          __sg_keyword_search_rank: item.__sg_keyword_search_rank
        }));
      }
    }
    rows = rows
      .filter(visibleKeywordRow)
      .slice()
      .sort((a, b) => {
        if (searchQuery) {
          const rankA = Number(a && a.__sg_keyword_search_rank || 0) || 999999;
          const rankB = Number(b && b.__sg_keyword_search_rank || 0) || 999999;
          if (rankA !== rankB) return rankA - rankB;
        }
        const productDelta = Number(b.product_count || 0) - Number(a.product_count || 0);
        if (productDelta) return productDelta;
        return Number(b.opportunity_score || 0) - Number(a.opportunity_score || 0);
      });
    if (!rows.length && searchQuery) {
      const summaryRow = keywordSearchSummaryRow(lang, radar, searchQuery, selectedCategory);
      if (summaryRow) rows = [summaryRow];
    }
    if (!rows.length) return "";
    const heading = selectedCategory ? selectedCategory + " · " + t(lang, "keywordDiscovery") : t(lang, "keywordDiscovery");
    return [
      '<section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(heading) + '</h2>',
      '<div class="mt-4 overflow-x-auto rounded-lg border border-slate-200">',
      '<table class="min-w-full divide-y divide-slate-200 text-sm">',
      '<thead class="bg-slate-50 text-xs font-black uppercase text-slate-500"><tr><th class="px-4 py-3 text-left">' + esc(t(lang, "query")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "products")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "categoriesLabel")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "metricDemand")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "metricCompetition")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "metricOpportunity")) + '</th><th class="px-4 py-3 text-left">' + esc(t(lang, "interpretation")) + '</th></tr></thead>',
      '<tbody class="divide-y divide-slate-100 bg-white">',
      rows.slice(0, 12).map((item) => [
        '<tr>',
        '<td class="px-4 py-3 font-black text-slate-950">' + esc(item.keyword || "-") + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums">' + esc(number(item.product_count || 0)) + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums">' + esc(number(item.category_count || 0)) + '</td>',
        '<td class="px-4 py-3 text-right">' + scorePill(item.demand_score) + '</td>',
        '<td class="px-4 py-3 text-right">' + scorePill(item.competition_score) + '</td>',
        '<td class="px-4 py-3 text-right">' + scorePill(item.opportunity_score) + '</td>',
        '<td class="px-4 py-3 text-slate-600">' + esc(item.interpretation || "") + '</td>',
        '</tr>'
      ].join("")).join(""),
      '</tbody></table></div>',
      '</section>'
    ].join("");
  }

  function renderCrossAnalysis(lang, radar, selectedCategory) {
    let rows = selectedCategory
      ? scopedCategoryKeywordRows(radar, selectedCategory)
      : scopedCategoryKeywordRows(radar, "");
    if (activeKeywordSearchQuery(radar)) {
      rows = keywordSearchFocusedRows(radar, rows);
      if (!rows.length && selectedCategory) rows = keywordSearchFallbackRows(radar);
    }
    if (!rows.length) return "";
    const heading = selectedCategory ? selectedCategory + " · " + t(lang, "keywordAnalysis") : t(lang, "crossAnalysis");
    return [
      '<section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(heading) + '</h2>',
      '<div class="mt-4 overflow-x-auto rounded-lg border border-slate-200">',
      '<table class="min-w-full divide-y divide-slate-200 text-sm">',
      '<thead class="bg-slate-50 text-xs font-black uppercase text-slate-500"><tr>' + (selectedCategory ? '' : '<th class="px-4 py-3 text-left">' + esc(t(lang, "category")) + '</th>') + '<th class="px-4 py-3 text-left">' + esc(t(lang, "query")) + '</th><th class="px-4 py-3 text-left">Cluster</th><th class="px-4 py-3 text-right">' + esc(t(lang, "products")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "p25")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "p50")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "p75")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "metricGap")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "metricOpportunity")) + '</th><th class="px-4 py-3 text-left">' + esc(t(lang, "interpretation")) + '</th></tr></thead>',
      '<tbody class="divide-y divide-slate-100 bg-white">',
      rows.slice(0, 16).map((item) => [
        '<tr>',
        selectedCategory ? '' : '<td class="px-4 py-3 font-bold text-slate-700">' + esc(item.source_category || "-") + '</td>',
        '<td class="px-4 py-3 font-black text-slate-950">' + esc(item.keyword || "-") + '</td>',
        '<td class="px-4 py-3 text-slate-600">' + esc(item.cluster_label || "-") + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums">' + esc(number(item.product_count || 0)) + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums">' + esc(krw(item.p25_price_krw || 0)) + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums font-black text-slate-950">' + esc(krw(item.median_price_krw || 0)) + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums">' + esc(krw(item.p75_price_krw || 0)) + '</td>',
        '<td class="px-4 py-3 text-right">' + scorePill(item.price_gap_score) + '</td>',
        '<td class="px-4 py-3 text-right">' + scorePill(item.opportunity_score) + '</td>',
        '<td class="px-4 py-3 text-slate-600">' + esc(item.interpretation || "") + '</td>',
        '</tr>'
      ].join("")).join(""),
      '</tbody></table></div>',
      '</section>'
    ].join("");
  }

  function renderPricePositioning(lang, radar, selectedCategory) {
    if (selectedCategory) {
      let rows = scopedCategoryKeywordRows(radar, selectedCategory);
      if (activeKeywordSearchQuery(radar)) {
        rows = keywordSearchFocusedRows(radar, rows);
        if (!rows.length) rows = keywordSearchFallbackRows(radar);
      }
      if (!rows.length) return "";
      return [
        '<section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">',
        '<h2 class="text-lg font-black text-slate-950">' + esc(selectedCategory + " · " + t(lang, "keywordPricePositioning")) + '</h2>',
        '<div class="mt-4 overflow-x-auto rounded-lg border border-slate-200">',
        '<table class="min-w-full divide-y divide-slate-200 text-sm">',
        '<thead class="bg-slate-50 text-xs font-black uppercase text-slate-500"><tr><th class="px-4 py-3 text-left">' + esc(t(lang, "query")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "products")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "p25")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "p50")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "p75")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "iqr")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "metricGap")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "metricOpportunity")) + '</th><th class="px-4 py-3 text-left">' + esc(t(lang, "interpretation")) + '</th></tr></thead>',
        '<tbody class="divide-y divide-slate-100 bg-white">',
        rows.slice(0, 16).map((item) => [
          '<tr>',
          '<td class="px-4 py-3 font-black text-slate-950">' + esc(item.keyword || "-") + '</td>',
          '<td class="px-4 py-3 text-right tabular-nums">' + esc(number(item.product_count || 0)) + '</td>',
          '<td class="px-4 py-3 text-right tabular-nums">' + esc(krw(item.p25_price_krw || 0)) + '</td>',
          '<td class="px-4 py-3 text-right tabular-nums font-black text-slate-950">' + esc(krw(item.median_price_krw || 0)) + '</td>',
          '<td class="px-4 py-3 text-right tabular-nums">' + esc(krw(item.p75_price_krw || 0)) + '</td>',
          '<td class="px-4 py-3 text-right tabular-nums">' + esc(krw(item.iqr_price_krw || 0)) + '</td>',
          '<td class="px-4 py-3 text-right">' + scorePill(item.price_gap_score) + '</td>',
          '<td class="px-4 py-3 text-right">' + scorePill(item.opportunity_score) + '</td>',
          '<td class="px-4 py-3 text-slate-600">' + esc(item.interpretation || "") + '</td>',
          '</tr>'
        ].join("")).join(""),
        '</tbody></table></div>',
        '</section>'
      ].join("");
    }
    const rows = (radar && radar.price_bands) || [];
    if (!rows.length) return "";
    return [
      '<section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "pricePositioning")) + '</h2>',
      '<div class="mt-4 overflow-x-auto rounded-lg border border-slate-200">',
      '<table class="min-w-full divide-y divide-slate-200 text-sm">',
      '<thead class="bg-slate-50 text-xs font-black uppercase text-slate-500"><tr><th class="px-4 py-3 text-left">' + esc(t(lang, "price")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "products")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "productShare")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "reviews")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "orders")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "reactionShare")) + '</th><th class="px-4 py-3 text-left">' + esc(t(lang, "interpretation")) + '</th></tr></thead>',
      '<tbody class="divide-y divide-slate-100 bg-white">',
      rows.map((item) => [
        '<tr>',
        '<td class="px-4 py-3 font-black text-slate-950">' + esc(item.label || "-") + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums">' + esc(number(item.product_count || 0)) + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums">' + esc(pct(item.product_percent || 0)) + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums">' + esc(number(item.review_sum || 0)) + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums">' + esc(number(item.order_sum || 0)) + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums font-black text-slate-950">' + esc(pct(item.reaction_percent || 0)) + '</td>',
        '<td class="px-4 py-3 text-slate-600">' + esc(item.interpretation || "") + '</td>',
        '</tr>'
      ].join("")).join(""),
      '</tbody></table></div>',
      '</section>'
    ].join("");
  }

  function renderKeywordTableTabs(lang, panels) {
    panels = (panels || []).filter((panel) => panel && panel.html);
    if (!panels.length) return "";
    if (panels.length === 1) return panels[0].html;
    const activeKey = panels[0].key;
    return [
      '<section class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm" data-keyword-table-tabs>',
      '<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">',
      '<h2 class="text-base font-black text-slate-950">' + esc(t(lang, "keywordViews")) + '</h2>',
      '<div class="inline-flex w-fit rounded-lg border border-slate-200 bg-slate-50 p-1" role="tablist">',
      panels.map((panel) => {
        const active = panel.key === activeKey;
        return '<button type="button" role="tab" data-keyword-tab-button="' + esc(panel.key) + '" aria-selected="' + (active ? "true" : "false") + '" class="' + keywordTabButtonClass(active) + '">' + esc(panel.label) + '</button>';
      }).join(""),
      '</div>',
      '</div>',
      '</section>',
      panels.map((panel) => {
        const active = panel.key === activeKey;
        return '<div data-keyword-tab-panel="' + esc(panel.key) + '" class="' + (active ? "" : "hidden") + '">' + panel.html + '</div>';
      }).join("")
    ].join("");
  }

  function keywordTabButtonClass(active) {
    return "rounded-md px-3 py-2 text-xs font-black transition focus:outline-none focus:ring-2 focus:ring-blue-300 " + (active ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900");
  }

  function categoryKeywordLensRows(radar, selectedCategory) {
    if (!selectedCategory) return [];
    return scopedCategoryKeywordRows(radar, selectedCategory)
      .slice()
      .sort((a, b) => {
        const productDelta = Number(b.product_count || 0) - Number(a.product_count || 0);
        if (productDelta) return productDelta;
        return Number(b.opportunity_score || 0) - Number(a.opportunity_score || 0);
      })
      .slice(0, 12);
  }

  function renderCategoryKeywordLens(lang, radar, selectedCategory) {
    const rows = categoryKeywordLensRows(radar, selectedCategory);
    if (!rows.length) return "";
    return [
      '<section>',
      '<div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(selectedCategory + " · " + t(lang, "categoryKeywordLens")) + '</h2>',
      '<span class="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">' + esc(t(lang, "keywordMode")) + '</span>',
      '</div>',
      chartRailHTML(lang, [
      chartBox("sg-shopping-category-keyword-score", t(lang, "categoryKeywordScoreChart")),
      chartBox("sg-shopping-category-keyword-price", t(lang, "categoryKeywordPriceChart"))
      ]),
      '</section>'
    ].join("");
  }

  function paintCategoryKeywordLensCharts(lang, rows) {
    const labels = (rows || []).map((row) => String(row.keyword || "-").slice(0, 14));
    paintChart("sg-shopping-category-keyword-score", lang, rows && rows.length ? {
      color: ["#2563eb", "#f59e0b", "#dc2626"],
      tooltip: { trigger: "axis" },
      legend: { bottom: 0, textStyle: chartTextStyle() },
      grid: { left: 48, right: 16, top: 20, bottom: 58 },
      xAxis: { type: "category", data: labels, axisLabel: { ...chartTextStyle(), rotate: 20, interval: 0 } },
      yAxis: { type: "value", min: 0, max: 100, axisLabel: { formatter: "{value}" } },
      series: [
        { type: "bar", name: t(lang, "metricDemand"), data: rows.map((row) => Number(row.demand_score || 0)), barMaxWidth: 24, itemStyle: { borderRadius: [5, 5, 0, 0] } },
        { type: "line", name: t(lang, "metricCompetition"), data: rows.map((row) => Number(row.competition_score || 0)), smooth: true, symbolSize: 7 },
        { type: "bar", name: t(lang, "metricOpportunity"), data: rows.map((row) => Number(row.opportunity_score || 0)), barMaxWidth: 24, itemStyle: { borderRadius: [5, 5, 0, 0] } }
      ]
    } : null);

    paintChart("sg-shopping-category-keyword-price", lang, rows && rows.some((row) => Number(row.median_price_krw || 0) > 0) ? {
      color: ["#0f766e", "#94a3b8", "#7c3aed"],
      tooltip: { trigger: "axis" },
      legend: { bottom: 0, textStyle: chartTextStyle() },
      grid: { left: 62, right: 18, top: 20, bottom: 58 },
      xAxis: { type: "category", data: labels, axisLabel: { ...chartTextStyle(), rotate: 20, interval: 0 } },
      yAxis: { type: "value", name: "₩", axisLabel: { formatter: function (value) { return number(value); } } },
      series: [
        { type: "bar", name: t(lang, "p50"), data: rows.map((row) => Number(row.median_price_krw || 0)), barMaxWidth: 30, itemStyle: { borderRadius: [5, 5, 0, 0] } },
        { type: "line", name: t(lang, "p25"), data: rows.map((row) => Number(row.p25_price_krw || 0)), smooth: true, symbolSize: 7 },
        { type: "line", name: t(lang, "p75"), data: rows.map((row) => Number(row.p75_price_krw || 0)), smooth: true, symbolSize: 7 }
      ]
    } : null);
  }

  function weightedAverageRows(rows, field) {
    let total = 0;
    let weight = 0;
    (rows || []).forEach((row) => {
      const value = Number(row && row[field] || 0);
      const w = Math.max(1, Number(row && row.product_count || 0));
      if (!Number.isFinite(value) || value <= 0) return;
      total += value * w;
      weight += w;
    });
    return weight > 0 ? Math.round(total / weight) : 0;
  }

  function uniqueText(values) {
    const seen = {};
    const rows = [];
    (values || []).forEach((value) => {
      const text = String(value || "").trim();
      const key = categorySlug(text);
      if (!text || !key || seen[key]) return;
      seen[key] = true;
      rows.push(text);
    });
    return rows;
  }

  function keywordTextProducts(radar, row) {
    const queries = uniqueText([
      row && row.keyword,
      row && row.keyword_key,
      row && row.__sg_keyword_search_query,
      activeKeywordSearchQuery(radar)
    ]);
    if (!queries.length) return [];
    return uniqueShoppingItems(((radar && radar.deal_candidates) || []).concat((radar && radar.products) || []))
      .filter((item) => queries.some((query) => productMatchesSearchQuery(item, query)));
  }

  function productCategories(items) {
    return uniqueText((items || []).map((item) => item && (standardCategoryName(item.source_category) || item.source_category)).filter(Boolean));
  }

  function keywordStatsRows(radar, selectedKeywords) {
    const baseRows = baseKeywordRows(radar);
    const display = keywordDisplayMap(radar);
    const selectedKeys = (selectedKeywords || []).filter((keyword) => !excludedKeyword(keyword)).map((keyword) => keywordKey(keyword)).filter(Boolean);
    const targetKeys = selectedKeys.length
      ? selectedKeys
      : baseRows.slice(0, 8).map((row) => keywordKey(row.keyword)).filter(Boolean);
    const baseByKey = {};
    baseRows.forEach((row) => {
      const key = keywordKey(row.keyword);
      if (key && !baseByKey[key]) baseByKey[key] = row;
    });
    const searchRows = ((radar && radar.keywords) || []).concat((radar && radar.category_keywords) || []).filter(visibleKeywordRow);
    const searchQuery = activeKeywordSearchQuery(radar);
    const scopedByKey = {};
    ((radar && radar.category_keywords) || []).forEach((row) => {
      if (!visibleKeywordRow(row)) return;
      const key = keywordKey(row && row.keyword);
      if (!key) return;
      if (!scopedByKey[key]) scopedByKey[key] = [];
      scopedByKey[key].push(row);
      if (!display[key]) display[key] = row.keyword;
    });
    return uniqueSlugs(targetKeys).map((key) => {
      const base = baseByKey[key] || searchRows.find((row) => keywordKey(row && row.keyword) === key) || (searchQuery && keywordKey(searchQuery) === key ? searchRows.find((row) => keywordRowMatchesSearchQuery(row, searchQuery)) : null) || {};
      const scoped = scopedByKey[key] || [];
      const label = display[key] || base.keyword || keywordPathDisplay(key) || key;
      const fallbackProducts = keywordTextProducts(radar, {
        keyword: label,
        keyword_key: key,
        __sg_keyword_search_query: searchQuery
      });
      const fallbackCategories = productCategories(fallbackProducts);
      const categories = uniqueText(scoped.map((row) => row.source_category).concat(fallbackCategories));
      const scopedProducts = scoped.reduce((sum, row) => sum + Number(row.product_count || 0), 0);
      const productPrices = fallbackProducts.map((item) => Number(item && item.price_krw || 0)).filter((value) => Number.isFinite(value) && value > 0);
      const p25 = weightedAverageRows(scoped, "p25_price_krw") || Number(base.p25_price_krw || 0) || percentileValue(productPrices, 0.25);
      const p50 = weightedAverageRows(scoped, "median_price_krw") || Number(base.median_price_krw || 0) || medianValue(productPrices);
      const p75 = weightedAverageRows(scoped, "p75_price_krw") || Number(base.p75_price_krw || 0) || percentileValue(productPrices, 0.75);
      const demand = Number(base.demand_score || 0) || weightedAverageRows(scoped, "demand_score");
      const competition = Number(base.competition_score || 0) || weightedAverageRows(scoped, "competition_score");
      const opportunity = Number(base.opportunity_score || 0) || weightedAverageRows(scoped, "opportunity_score");
      return {
        keyword: label,
        keyword_key: key,
        product_count: Number(base.product_count || 0) || scopedProducts || fallbackProducts.length,
        category_count: Number(base.category_count || 0) || categories.length,
        p25_price_krw: p25,
        median_price_krw: p50,
        p75_price_krw: p75,
        iqr_price_krw: weightedAverageRows(scoped, "iqr_price_krw") || (p75 && p25 ? Math.max(0, p75 - p25) : 0),
        price_gap_score: Number(base.price_gap_score || 0) || weightedAverageRows(scoped, "price_gap_score"),
        demand_score: demand,
        competition_score: competition,
        opportunity_score: opportunity,
        categories: categories.slice(0, 5),
        interpretation: base.interpretation || "",
        __sg_keyword_search_query: searchQuery || ""
      };
    }).filter((row) => row && row.keyword);
  }

  function keywordCategoryInfo(radar, row) {
    const key = row && row.keyword_key ? row.keyword_key : keywordKey(row && row.keyword);
    const set = {};
    const labels = [];
    function add(value) {
      const label = String(value || "").trim();
      const slug = categorySlug(label);
      if (!slug || set[slug]) return;
      set[slug] = true;
      labels.push(label);
    }
    (row && row.categories || []).forEach(add);
    ((radar && radar.category_keywords) || []).forEach((entry) => {
      if (keywordKey(entry && entry.keyword) === key) add(entry && entry.source_category);
    });
    return { key: key, set: set, labels: labels };
  }

  function keywordProductScore(item, row, info) {
    const key = info && info.key ? info.key : (row && row.keyword_key ? row.keyword_key : keywordKey(row && row.keyword));
    if (!key || !item) return 0;
    let score = 0;
    const query = row && row.__sg_keyword_search_query ? row.__sg_keyword_search_query : "";
    const productText = productSearchText(item);
    if (keywordSearchTextMatches(productText, row && row.keyword)) score = Math.max(score, 105);
    if (keywordSearchTextMatches(productText, key)) score = Math.max(score, 100);
    if (query && keywordSearchTextMatches(productText, query)) score = Math.max(score, 96);
    const fields = [
      item && item.keyword,
      item && item.product_name,
      item && item.product_label,
      item && item.provider_label
    ];
    fields.forEach((field) => {
      const text = keywordKey(field || "");
      if (!text) return;
      if (text === key) score = Math.max(score, 110);
      else if (text.indexOf(key) >= 0 || key.indexOf(text) >= 0) score = Math.max(score, 85);
    });
    const itemCategorySlug = categorySlug(item && item.source_category);
    if (itemCategorySlug && info && info.set && info.set[itemCategorySlug]) score = Math.max(score, 48);
    if (itemCategorySlug && itemCategorySlug.indexOf(key) >= 0) score = Math.max(score, 40);
    const categoryText = keywordKey(item && item.source_category);
    if (categoryText && (categoryText === key || categoryText.indexOf(key) >= 0 || key.indexOf(categoryText) >= 0)) score = Math.max(score, 38);
    if (!score) return 0;
    score += Math.min(20, Number(item && (item.deal_confidence_score || item.radar_score) || 0) / 5);
    score += Math.min(12, Number(item && item.discount_percent || 0) / 4);
    score += Math.min(12, Number(item && item.below_category_median_percent || 0) / 4);
    const price = Number(item && item.price_krw || 0);
    if (price > 0 && price <= Number(row && row.p75_price_krw || 0)) score += 4;
    return score;
  }

  function itemMatchesKeyword(item, row, radar) {
    return keywordProductScore(item, row, keywordCategoryInfo(radar, row)) > 0;
  }

  function keywordProducts(radar, row, limit) {
    const pool = ((radar && radar.deal_candidates) || []).concat((radar && radar.products) || []);
    const seen = {};
    const info = keywordCategoryInfo(radar, row);
    const scored = [];
    pool.forEach((item) => {
      const score = keywordProductScore(item, row, info);
      if (score <= 0) return;
      const key = itemKey(item) || [providerKey(item), productLabel(item), item && item.price_krw].join(":");
      if (seen[key]) return;
      seen[key] = true;
      scored.push({ item: item, score: score });
    });
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const reactionDelta = Number((b.item && b.item.review_count) || 0) - Number((a.item && a.item.review_count) || 0);
      if (reactionDelta) return reactionDelta;
      return Number((a.item && a.item.price_krw) || 0) - Number((b.item && b.item.price_krw) || 0);
    });
    const count = Number(limit || 0);
    return (count > 0 ? scored.slice(0, count) : scored).map((entry) => entry.item);
  }

  function productColumnCount() {
    const width = Math.max(document.documentElement && document.documentElement.clientWidth || 0, window.innerWidth || 0);
    if (productViewMode() !== "large") {
      if (width >= 1536) return 7;
      if (width >= 1280) return 6;
      if (width >= 1024) return 4;
      if (width >= 640) return 3;
      return 2;
    }
    if (width >= 1536) return 5;
    if (width >= 1280) return 4;
    if (width >= 1024) return 3;
    if (width >= 640) return 2;
    return 1;
  }

  function keywordProductColumnCount() {
    return productColumnCount();
  }

  function keywordProductPageSize() {
    return Math.max(5, keywordProductColumnCount() * 5);
  }

  function renderKeywordHero(lang, rows) {
    if (!rows.length) {
      return '<section class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">' + esc(t(lang, "chartEmpty")) + '</section>';
    }
    const total = rows.reduce((sum, row) => sum + Number(row.product_count || 0), 0);
    const uniqueCategories = uniqueText(rows.reduce((items, row) => items.concat(row.categories || []), []));
    const categoryTotal = uniqueCategories.length || rows.reduce((sum, row) => sum + Number(row.category_count || 0), 0);
    const medians = rows.map((row) => Number(row.median_price_krw || 0)).filter((value) => value > 0);
    const medianRange = medians.length ? krw(Math.min.apply(null, medians)) + " - " + krw(Math.max.apply(null, medians)) : "-";
    return [
      '<section>',
      '<div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "compareKeywordTitle")) + '</h2>',
      postSelectionForm(lang, "clear", "", '<button type="submit" class="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-600 hover:border-slate-400">' + esc(t(lang, "clearSelection")) + '</button>', "contents"),
      '</div>',
      '<div class="grid grid-cols-1 gap-3 md:grid-cols-3">',
      metricCard(t(lang, "selectedKeywords"), number(rows.length), t(lang, "keywordMode")),
      metricCard(t(lang, "totalProducts"), number(total), t(lang, "products")),
      metricCard(t(lang, "categoryCoverage"), number(categoryTotal), t(lang, "categoriesLabel")),
      '</div>',
      '<div class="mt-3 flex flex-wrap gap-2">',
      rows.map((row) => '<span class="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-700">#' + esc(row.keyword || "-") + '</span>').join(""),
      '</div>',
      medians.length ? '<div class="mt-3 text-xs font-bold text-slate-500">' + esc(t(lang, "medianOfMedians")) + ' · ' + esc(medianRange) + '</div>' : '',
      '</section>'
    ].join("");
  }

  function renderKeywordChartsShell(lang) {
    return chartRailHTML(lang, [
      chartBox("sg-shopping-keyword-score", t(lang, "keywordScoreChart")),
      chartBox("sg-shopping-keyword-price", t(lang, "keywordPriceChart")),
      chartBox("sg-shopping-keyword-coverage", t(lang, "keywordCoverageChart"))
    ]);
  }

  function renderKeywordTable(lang, rows) {
    if (!rows.length) return "";
    return [
      '<section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "keywordSummary")) + '</h2>',
      '<div class="mt-4 overflow-x-auto rounded-lg border border-slate-200">',
      '<table class="min-w-full divide-y divide-slate-200 text-sm">',
      '<thead class="bg-slate-50 text-xs font-black uppercase text-slate-500"><tr><th class="px-4 py-3 text-left">' + esc(t(lang, "query")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "products")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "categoriesLabel")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "p50")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "metricDemand")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "metricCompetition")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "metricOpportunity")) + '</th><th class="px-4 py-3 text-left">' + esc(t(lang, "categoryCoverage")) + '</th></tr></thead>',
      '<tbody class="divide-y divide-slate-100 bg-white">',
      rows.map((row) => [
        '<tr>',
        '<td class="px-4 py-3 font-black text-slate-950">#' + esc(row.keyword || "-") + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums">' + esc(number(row.product_count || 0)) + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums">' + esc(number(row.category_count || 0)) + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums font-black text-slate-950">' + esc(krw(row.median_price_krw || 0)) + '</td>',
        '<td class="px-4 py-3 text-right">' + scorePill(row.demand_score) + '</td>',
        '<td class="px-4 py-3 text-right">' + scorePill(row.competition_score) + '</td>',
        '<td class="px-4 py-3 text-right">' + scorePill(row.opportunity_score) + '</td>',
        '<td class="px-4 py-3 text-slate-600">' + esc((row.categories || []).join(", ") || "-") + '</td>',
        '</tr>'
      ].join("")).join(""),
      '</tbody></table></div>',
      '</section>'
    ].join("");
  }

  function renderKeywordProducts(lang, radar, rows) {
    const explicitKeyword = selectedKeywordsFromURL().length > 0;
    const pageSize = keywordProductPageSize();
    const visible = (rows || []).map((row) => ({ row: row, products: keywordProducts(radar, row, explicitKeyword ? 60 : 24) })).filter((entry) => entry.products.length);
    if (!visible.length) return "";
    return [
      '<section>',
      productListHeaderHTML(lang, t(lang, "keywordProducts"), visible.reduce((sum, entry) => sum + entry.products.length, 0)),
      '<div class="grid grid-cols-1 gap-4">',
      visible.map((entry) => [
        '<section class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm" data-keyword-products-section data-keyword-product-page="0">',
        '<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">',
        '<h3 class="text-base font-black text-slate-950">#' + esc(entry.row.keyword || "-") + '</h3>',
        '<span class="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">' + esc(number(entry.products.length)) + ' ' + esc(t(lang, "products")) + '</span>',
        '</div>',
        '<div class="mt-3 ' + productGridClass() + '" data-keyword-products-grid>',
        entry.products.map((item, index) => '<div class="' + (index >= pageSize ? "hidden " : "") + 'h-full" data-keyword-product-card>' + productCard(lang, item) + '</div>').join(""),
        '</div>',
        '<div class="mt-4 flex items-center justify-between gap-3 ' + (entry.products.length <= pageSize ? "hidden" : "") + '" data-keyword-products-pager>',
        '<span class="text-xs font-bold text-slate-500" data-keyword-page-status>1 / 1</span>',
        '<div class="inline-flex items-center gap-2">',
        '<button type="button" class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-black text-slate-700 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40" title="' + esc(t(lang, "prevPage")) + '" aria-label="' + esc(t(lang, "prevPage")) + '" data-keyword-page-prev>&lt;</button>',
        '<button type="button" class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-black text-slate-700 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40" title="' + esc(t(lang, "nextPage")) + '" aria-label="' + esc(t(lang, "nextPage")) + '" data-keyword-page-next>&gt;</button>',
        '</div>',
        '</div>',
        '</section>'
      ].join("")).join(""),
      '</div>',
      '</section>'
    ].join("");
  }

  function updateKeywordProductSection(section) {
    const cards = Array.prototype.slice.call(section.querySelectorAll("[data-keyword-product-card]"));
    if (!cards.length) return;
    const pageSize = keywordProductPageSize();
    const totalPages = Math.max(1, Math.ceil(cards.length / pageSize));
    let page = Number(section.getAttribute("data-keyword-product-page") || 0);
    if (!Number.isFinite(page) || page < 0) page = 0;
    if (page >= totalPages) page = totalPages - 1;
    section.setAttribute("data-keyword-product-page", String(page));
    const start = page * pageSize;
    const end = start + pageSize;
    cards.forEach((card, index) => {
      card.classList.toggle("hidden", index < start || index >= end);
    });
    const pager = section.querySelector("[data-keyword-products-pager]");
    if (pager) pager.classList.toggle("hidden", totalPages <= 1);
    const status = section.querySelector("[data-keyword-page-status]");
    if (status) status.textContent = String(page + 1) + " / " + String(totalPages);
    const prev = section.querySelector("[data-keyword-page-prev]");
    const next = section.querySelector("[data-keyword-page-next]");
    if (prev) prev.disabled = page <= 0;
    if (next) next.disabled = page >= totalPages - 1;
  }

  function setupKeywordProductPagination(appEl) {
    if (!appEl) return;
    const sections = Array.prototype.slice.call(appEl.querySelectorAll("[data-keyword-products-section]"));
    sections.forEach((section) => {
      if (!section.getAttribute("data-keyword-product-page")) section.setAttribute("data-keyword-product-page", "0");
      const prev = section.querySelector("[data-keyword-page-prev]");
      const next = section.querySelector("[data-keyword-page-next]");
      if (prev && !prev.getAttribute("data-bound")) {
        prev.setAttribute("data-bound", "1");
        prev.addEventListener("click", function () {
          section.setAttribute("data-keyword-product-page", String(Math.max(0, Number(section.getAttribute("data-keyword-product-page") || 0) - 1)));
          updateKeywordProductSection(section);
        });
      }
      if (next && !next.getAttribute("data-bound")) {
        next.setAttribute("data-bound", "1");
        next.addEventListener("click", function () {
          section.setAttribute("data-keyword-product-page", String(Number(section.getAttribute("data-keyword-product-page") || 0) + 1));
          updateKeywordProductSection(section);
        });
      }
      updateKeywordProductSection(section);
    });
    if (!window.__statgroundKeywordProductResizeBound) {
      window.__statgroundKeywordProductResizeBound = true;
      window.addEventListener("resize", function () {
        clearTimeout(window.__statgroundKeywordProductResizeTimer);
        window.__statgroundKeywordProductResizeTimer = setTimeout(function () {
          document.querySelectorAll("[data-keyword-products-section]").forEach(updateKeywordProductSection);
        }, 120);
      });
    }
  }

  function evidenceProductPageSize() {
    return Math.max(5, productColumnCount() * 5);
  }

  function evidenceProductPagerHTML(lang, count, pageSize) {
    return [
      '<div class="mt-4 flex items-center justify-between gap-3 ' + (count <= pageSize ? "hidden" : "") + '" data-evidence-products-pager>',
      '<span class="text-xs font-bold text-slate-500" data-evidence-page-status>1 / 1</span>',
      '<div class="inline-flex items-center gap-2">',
      '<button type="button" class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-black text-slate-700 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40" title="' + esc(t(lang, "prevPage")) + '" aria-label="' + esc(t(lang, "prevPage")) + '" data-evidence-page-prev>&lt;</button>',
      '<button type="button" class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-black text-slate-700 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40" title="' + esc(t(lang, "nextPage")) + '" aria-label="' + esc(t(lang, "nextPage")) + '" data-evidence-page-next>&gt;</button>',
      '</div>',
      '</div>'
    ].join("");
  }

  function renderEvidenceProductGrid(lang, items) {
    const rows = items || [];
    const pageSize = evidenceProductPageSize();
    return [
      '<div data-evidence-products-section data-evidence-product-page="0">',
      '<div class="' + productGridClass() + '" data-evidence-products-grid>',
      rows.map((item, index) => '<div class="' + (index >= pageSize ? "hidden " : "") + 'h-full" data-evidence-product-card>' + productCard(lang, item) + '</div>').join(""),
      '</div>',
      evidenceProductPagerHTML(lang, rows.length, pageSize),
      '</div>'
    ].join("");
  }

  function updateEvidenceProductSection(section) {
    const cards = Array.prototype.slice.call(section.querySelectorAll("[data-evidence-product-card]"));
    if (!cards.length) return;
    const pageSize = evidenceProductPageSize();
    const totalPages = Math.max(1, Math.ceil(cards.length / pageSize));
    let page = Number(section.getAttribute("data-evidence-product-page") || 0);
    if (!Number.isFinite(page) || page < 0) page = 0;
    if (page >= totalPages) page = totalPages - 1;
    section.setAttribute("data-evidence-product-page", String(page));
    const start = page * pageSize;
    const end = start + pageSize;
    cards.forEach((card, index) => {
      card.classList.toggle("hidden", index < start || index >= end);
    });
    const pager = section.querySelector("[data-evidence-products-pager]");
    if (pager) pager.classList.toggle("hidden", totalPages <= 1);
    const status = section.querySelector("[data-evidence-page-status]");
    if (status) status.textContent = String(page + 1) + " / " + String(totalPages);
    const prev = section.querySelector("[data-evidence-page-prev]");
    const next = section.querySelector("[data-evidence-page-next]");
    if (prev) prev.disabled = page <= 0;
    if (next) next.disabled = page >= totalPages - 1;
  }

  function setupEvidenceProductPagination(appEl) {
    if (!appEl) return;
    const sections = Array.prototype.slice.call(appEl.querySelectorAll("[data-evidence-products-section]"));
    sections.forEach((section) => {
      if (!section.getAttribute("data-evidence-product-page")) section.setAttribute("data-evidence-product-page", "0");
      const prev = section.querySelector("[data-evidence-page-prev]");
      const next = section.querySelector("[data-evidence-page-next]");
      if (prev && !prev.getAttribute("data-bound")) {
        prev.setAttribute("data-bound", "1");
        prev.addEventListener("click", function () {
          section.setAttribute("data-evidence-product-page", String(Math.max(0, Number(section.getAttribute("data-evidence-product-page") || 0) - 1)));
          updateEvidenceProductSection(section);
        });
      }
      if (next && !next.getAttribute("data-bound")) {
        next.setAttribute("data-bound", "1");
        next.addEventListener("click", function () {
          section.setAttribute("data-evidence-product-page", String(Number(section.getAttribute("data-evidence-product-page") || 0) + 1));
          updateEvidenceProductSection(section);
        });
      }
      updateEvidenceProductSection(section);
    });
    if (!window.__statgroundEvidenceProductResizeBound) {
      window.__statgroundEvidenceProductResizeBound = true;
      window.addEventListener("resize", function () {
        clearTimeout(window.__statgroundEvidenceProductResizeTimer);
        window.__statgroundEvidenceProductResizeTimer = setTimeout(function () {
          document.querySelectorAll("[data-evidence-products-section]").forEach(updateEvidenceProductSection);
        }, 120);
      });
    }
  }

  function keywordCategoryLensRows(radar, selectedKeywords) {
    const selectedRows = keywordStatsRows(radar, selectedKeywords);
    const targetKeys = {};
    selectedRows.slice(0, selectedKeywords && selectedKeywords.length ? 8 : 4).forEach((row) => {
      const key = row && row.keyword_key ? row.keyword_key : keywordKey(row && row.keyword);
      if (key) targetKeys[key] = row.keyword || key;
    });
    const exactRows = ((radar && radar.category_keywords) || []).filter(visibleKeywordRow)
      .filter((row) => {
        const key = keywordKey(row && row.keyword);
        return key && targetKeys[key];
      })
      .map((row) => ({
        keyword: targetKeys[keywordKey(row.keyword)] || row.keyword || "",
        source_category: row.source_category || "",
        product_count: Number(row.product_count || 0),
        p25_price_krw: Number(row.p25_price_krw || 0),
        median_price_krw: Number(row.median_price_krw || 0),
        p75_price_krw: Number(row.p75_price_krw || 0),
        demand_score: Number(row.demand_score || 0),
        competition_score: Number(row.competition_score || 0),
        opportunity_score: Number(row.opportunity_score || 0),
        price_gap_score: Number(row.price_gap_score || 0),
        interpretation: row.interpretation || ""
      }))
      .sort((a, b) => {
        const keywordDelta = String(a.keyword || "").localeCompare(String(b.keyword || ""));
        if (keywordDelta) return keywordDelta;
        const productDelta = Number(b.product_count || 0) - Number(a.product_count || 0);
        if (productDelta) return productDelta;
        return Number(b.opportunity_score || 0) - Number(a.opportunity_score || 0);
      })
      .slice(0, 24);
    if (exactRows.length) return exactRows;
    const fallbackRows = [];
    selectedRows.forEach((row) => {
      const buckets = {};
      keywordProducts(radar, row, 0).forEach((item) => {
        const label = standardCategoryName(item && item.source_category) || String(item && item.source_category || "").trim();
        const slug = normalizedCategorySlug(label);
        if (!label || !slug) return;
        if (!buckets[slug]) {
          buckets[slug] = {
            keyword: row.keyword || "",
            source_category: label,
            prices: [],
            product_count: 0
          };
        }
        buckets[slug].product_count += 1;
        const price = Number(item && item.price_krw || 0);
        if (Number.isFinite(price) && price > 0) buckets[slug].prices.push(price);
      });
      Object.keys(buckets).forEach((slug) => {
        const bucket = buckets[slug];
        fallbackRows.push({
          keyword: bucket.keyword,
          source_category: bucket.source_category,
          product_count: bucket.product_count,
          p25_price_krw: percentileValue(bucket.prices, 0.25) || Number(row.p25_price_krw || 0),
          median_price_krw: medianValue(bucket.prices) || Number(row.median_price_krw || 0),
          p75_price_krw: percentileValue(bucket.prices, 0.75) || Number(row.p75_price_krw || 0),
          demand_score: Number(row.demand_score || 0),
          competition_score: Number(row.competition_score || 0),
          opportunity_score: Number(row.opportunity_score || 0),
          price_gap_score: Number(row.price_gap_score || row.opportunity_score || 0),
          interpretation: row.interpretation || ""
        });
      });
    });
    return fallbackRows.sort((a, b) => {
      const productDelta = Number(b.product_count || 0) - Number(a.product_count || 0);
      if (productDelta) return productDelta;
      return String(a.source_category || "").localeCompare(String(b.source_category || ""));
    }).slice(0, 24);
  }

  function renderKeywordCategoryLens(lang, radar, rows) {
    if (!rows.length) return "";
    return [
      '<section>',
      '<div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "keywordCategoryLens")) + '</h2>',
      '<span class="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">' + esc(t(lang, "categoryMode")) + '</span>',
      '</div>',
      chartRailHTML(lang, [
      chartBox("sg-shopping-keyword-category-score", t(lang, "keywordCategoryScoreChart")),
      chartBox("sg-shopping-keyword-category-price", t(lang, "keywordCategoryPriceChart"))
      ]),
      '<div class="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">',
      '<table class="min-w-full divide-y divide-slate-200 text-sm">',
      '<thead class="bg-slate-50 text-xs font-black uppercase text-slate-500"><tr><th class="px-4 py-3 text-left">' + esc(t(lang, "query")) + '</th><th class="px-4 py-3 text-left">' + esc(t(lang, "category")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "products")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "p50")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "metricDemand")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "metricCompetition")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "metricOpportunity")) + '</th></tr></thead>',
      '<tbody class="divide-y divide-slate-100 bg-white">',
      rows.map((row) => [
        '<tr>',
        '<td class="px-4 py-3 font-black text-slate-950">#' + esc(row.keyword || "-") + '</td>',
        '<td class="px-4 py-3 font-bold text-slate-700">' + esc(row.source_category || "-") + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums">' + esc(number(row.product_count || 0)) + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums font-black text-slate-950">' + esc(krw(row.median_price_krw || 0)) + '</td>',
        '<td class="px-4 py-3 text-right">' + scorePill(row.demand_score) + '</td>',
        '<td class="px-4 py-3 text-right">' + scorePill(row.competition_score) + '</td>',
        '<td class="px-4 py-3 text-right">' + scorePill(row.opportunity_score) + '</td>',
        '</tr>'
      ].join("")).join(""),
      '</tbody></table></div>',
      '</section>'
    ].join("");
  }

  function paintKeywordCategoryLensCharts(lang, rows) {
    const labels = (rows || []).map((row) => (String(row.keyword || "-").slice(0, 8) + " · " + String(row.source_category || "-").slice(0, 10)));
    paintChart("sg-shopping-keyword-category-score", lang, rows && rows.length ? {
      color: ["#2563eb", "#f59e0b", "#dc2626"],
      tooltip: { trigger: "axis" },
      legend: { bottom: 0, textStyle: chartTextStyle() },
      dataZoom: rows.length > 10 ? [{ type: "inside" }, { type: "slider", height: 16, bottom: 32 }] : [],
      grid: { left: 48, right: 16, top: 20, bottom: rows.length > 10 ? 82 : 58 },
      xAxis: { type: "category", data: labels, axisLabel: { ...chartTextStyle(), rotate: 25, interval: 0 } },
      yAxis: { type: "value", min: 0, max: 100, axisLabel: { formatter: "{value}" } },
      series: [
        { type: "bar", name: t(lang, "metricDemand"), data: rows.map((row) => Number(row.demand_score || 0)), barMaxWidth: 22, itemStyle: { borderRadius: [5, 5, 0, 0] } },
        { type: "line", name: t(lang, "metricCompetition"), data: rows.map((row) => Number(row.competition_score || 0)), smooth: true, symbolSize: 7 },
        { type: "bar", name: t(lang, "metricOpportunity"), data: rows.map((row) => Number(row.opportunity_score || 0)), barMaxWidth: 22, itemStyle: { borderRadius: [5, 5, 0, 0] } }
      ]
    } : null);

    paintChart("sg-shopping-keyword-category-price", lang, rows && rows.some((row) => Number(row.median_price_krw || 0) > 0) ? {
      color: ["#0f766e", "#94a3b8", "#7c3aed"],
      tooltip: { trigger: "axis" },
      legend: { bottom: 0, textStyle: chartTextStyle() },
      dataZoom: rows.length > 10 ? [{ type: "inside" }, { type: "slider", height: 16, bottom: 32 }] : [],
      grid: { left: 62, right: 18, top: 20, bottom: rows.length > 10 ? 82 : 58 },
      xAxis: { type: "category", data: labels, axisLabel: { ...chartTextStyle(), rotate: 25, interval: 0 } },
      yAxis: { type: "value", name: "₩", axisLabel: { formatter: function (value) { return number(value); } } },
      series: [
        { type: "bar", name: t(lang, "p50"), data: rows.map((row) => Number(row.median_price_krw || 0)), barMaxWidth: 28, itemStyle: { borderRadius: [5, 5, 0, 0] } },
        { type: "line", name: t(lang, "p25"), data: rows.map((row) => Number(row.p25_price_krw || 0)), smooth: true, symbolSize: 7 },
        { type: "line", name: t(lang, "p75"), data: rows.map((row) => Number(row.p75_price_krw || 0)), smooth: true, symbolSize: 7 }
      ]
    } : null);
  }

  function renderKeywordDashboard(lang, radar) {
    const selected = selectedKeywordsFromURL();
    const analysisRadar = priceFilteredRadar(radar, currentPriceRange());
    return [
      renderCategoryAxisStage(lang, radar, "", []),
      renderAnalysisModeSwitch(lang, "keyword"),
      renderAnalysisPath(lang, "keyword", "", selected),
      renderPriceBandCriteriaStage(lang, radar, "", selected, "keyword"),
      renderKeywordAxisStage(lang, analysisRadar, "", selected),
      renderMarketOverviewStage(lang, analysisRadar, ""),
      renderSegmentStage(lang, analysisRadar, "", selected, "keyword"),
      renderEvidenceStage(lang, analysisRadar, "", selected, "keyword")
    ].join("");
  }

  function paintKeywordCharts(lang, rows) {
    const labels = (rows || []).map((row) => String(row.keyword || "-").slice(0, 14));
    paintChart("sg-shopping-keyword-score", lang, rows && rows.length ? {
      color: ["#2563eb", "#f59e0b", "#dc2626"],
      tooltip: { trigger: "axis" },
      legend: { bottom: 0, textStyle: chartTextStyle() },
      grid: { left: 48, right: 16, top: 20, bottom: 58 },
      xAxis: { type: "category", data: labels, axisLabel: { ...chartTextStyle(), rotate: 20, interval: 0 } },
      yAxis: { type: "value", min: 0, max: 100, axisLabel: { formatter: "{value}" } },
      series: [
        { type: "bar", name: t(lang, "metricDemand"), data: rows.map((row) => Number(row.demand_score || 0)), barMaxWidth: 24, itemStyle: { borderRadius: [5, 5, 0, 0] } },
        { type: "line", name: t(lang, "metricCompetition"), data: rows.map((row) => Number(row.competition_score || 0)), smooth: true, symbolSize: 7 },
        { type: "bar", name: t(lang, "metricOpportunity"), data: rows.map((row) => Number(row.opportunity_score || 0)), barMaxWidth: 24, itemStyle: { borderRadius: [5, 5, 0, 0] } }
      ]
    } : null);

    const hasPrice = rows && rows.some((row) => Number(row.median_price_krw || 0) > 0);
    paintChart("sg-shopping-keyword-price", lang, hasPrice ? {
      color: ["#0f766e", "#94a3b8", "#7c3aed"],
      tooltip: { trigger: "axis" },
      legend: { bottom: 0, textStyle: chartTextStyle() },
      grid: { left: 62, right: 18, top: 20, bottom: 58 },
      xAxis: { type: "category", data: labels, axisLabel: { ...chartTextStyle(), rotate: 20, interval: 0 } },
      yAxis: { type: "value", name: "₩", axisLabel: { formatter: function (value) { return number(value); } } },
      series: [
        { type: "bar", name: t(lang, "p50"), data: rows.map((row) => Number(row.median_price_krw || 0)), barMaxWidth: 30, itemStyle: { borderRadius: [5, 5, 0, 0] } },
        { type: "line", name: t(lang, "p25"), data: rows.map((row) => Number(row.p25_price_krw || 0)), smooth: true, symbolSize: 7 },
        { type: "line", name: t(lang, "p75"), data: rows.map((row) => Number(row.p75_price_krw || 0)), smooth: true, symbolSize: 7 }
      ]
    } : null);

    paintChart("sg-shopping-keyword-coverage", lang, rows && rows.length ? {
      color: ["#0f766e", "#f59e0b"],
      tooltip: { trigger: "axis" },
      legend: { bottom: 0, textStyle: chartTextStyle() },
      grid: { left: 54, right: 16, top: 20, bottom: 58 },
      xAxis: { type: "category", data: labels, axisLabel: { ...chartTextStyle(), rotate: 20, interval: 0 } },
      yAxis: [
        { type: "value", name: t(lang, "products"), minInterval: 1, axisLabel: { formatter: function (value) { return number(value); } } },
        { type: "value", name: t(lang, "categoriesLabel"), minInterval: 1, axisLabel: { formatter: function (value) { return number(value); } } }
      ],
      series: [
        { type: "bar", name: t(lang, "products"), yAxisIndex: 0, data: rows.map((row) => Number(row.product_count || 0)), barMaxWidth: 30, itemStyle: { borderRadius: [5, 5, 0, 0] } },
        { type: "line", name: t(lang, "categoriesLabel"), yAxisIndex: 1, data: rows.map((row) => Number(row.category_count || 0)), smooth: true, symbolSize: 7 }
      ]
    } : null);
  }

  function categoryLookup(radar) {
    const lookup = {};
    categoryRows(radar).forEach((item) => {
      const slug = normalizedCategorySlug(item && item.source_category);
      if (slug && !lookup[slug]) lookup[slug] = item;
    });
    return lookup;
  }

  function radarScopedCategory(radar, fallbackSlug, baseLookup) {
    const scoped = radar && radar.scope_category ? String(radar.scope_category) : "";
    if (scoped) return standardCategoryName(scoped) || scoped;
    const localRows = categoryRows(radar);
    const requestedSlug = normalizedCategorySlug(fallbackSlug || "");
    const found = localRows.find((item) => normalizedCategorySlug(item && item.source_category) === requestedSlug);
    if (found && found.source_category) return found.source_category;
    const base = baseLookup && baseLookup[requestedSlug];
    return base && base.source_category ? base.source_category : (fallbackSlug || "");
  }

  function comparisonRows(baseRadar, pairs) {
    const baseLookup = categoryLookup(baseRadar);
    return (pairs || []).map((pair) => {
      const slug = normalizedCategorySlug(pair && pair.slug);
      const radar = pair && pair.radar ? pair.radar : {};
      const name = radarScopedCategory(radar, slug, baseLookup);
      const nameSlug = normalizedCategorySlug(name || slug);
      const localRows = categoryRows(radar);
      const local = localRows.find((item) => normalizedCategorySlug(item && item.source_category) === nameSlug) || (localRows.length === 1 ? localRows[0] : null);
      const base = baseLookup[nameSlug] || baseLookup[slug] || {};
      const row = local || base || {};
      const summary = radar && radar.summary ? radar.summary : {};
      const products = ((radar && radar.products) || []).length ? radar.products : ((radar && radar.deal_candidates) || []);
      const keywords = majorKeywordRows(radar, name).slice(0, 4);
      return {
        slug: nameSlug || slug,
        source_category: name || (row && row.source_category) || slug,
        product_count: Number(summary.product_count || row.product_count || 0),
        min_price_krw: Number(summary.min_price_krw || row.min_price_krw || 0),
        max_price_krw: Number(summary.max_price_krw || row.max_price_krw || 0),
        p25_price_krw: Number(row.p25_price_krw || 0),
        median_price_krw: Number(summary.median_price_krw || row.median_price_krw || 0),
        p75_price_krw: Number(row.p75_price_krw || 0),
        discounted_percent: Number(summary.discounted_percent || row.discounted_percent || 0),
        low_price_percent: Number(summary.low_price_percent || row.low_price_percent || 0),
        demand_score: Number(row.demand_score || 0),
        competition_score: Number(row.competition_score || 0),
        opportunity_score: Number(row.opportunity_score || 0),
        keywords: keywords,
        products: products.slice(0, 3)
      };
    }).filter((row) => row && row.slug);
  }

  function renderComparisonHero(lang, rows, loading) {
    if (loading) {
      return '<section class="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold text-slate-600 shadow-sm">' + esc(t(lang, "compareLoading")) + '</section>';
    }
    if (!rows.length) {
      return '<section class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">' + esc(t(lang, "compareEmpty")) + '</section>';
    }
    const total = rows.reduce((sum, row) => sum + Number(row.product_count || 0), 0);
    const medians = rows.map((row) => Number(row.median_price_krw || 0)).filter((value) => value > 0);
    const medianRange = medians.length ? krw(Math.min.apply(null, medians)) + " - " + krw(Math.max.apply(null, medians)) : "-";
    return [
      '<section>',
      '<div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "compareCategories")) + '</h2>',
      postSelectionForm(lang, "clear", "", '<button type="submit" class="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-600 hover:border-slate-400">' + esc(t(lang, "clearSelection")) + '</button>', "contents"),
      '</div>',
      '<div class="grid grid-cols-1 gap-3 md:grid-cols-3">',
      metricCard(t(lang, "selectedCount"), number(rows.length), t(lang, "compareView")),
      metricCard(t(lang, "totalProducts"), number(total), t(lang, "products")),
      metricCard(t(lang, "medianOfMedians"), medianRange, t(lang, "p50")),
      '</div>',
      '<div class="mt-3 flex flex-wrap gap-2">',
      rows.map((row) => '<span class="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-700">' + esc(row.source_category || "-") + '</span>').join(""),
      '</div>',
      '</section>'
    ].join("");
  }

  function renderComparisonChartsShell(lang) {
    return chartRailHTML(lang, [
      chartBox("sg-shopping-compare-score", t(lang, "compareScoreChart")),
      chartBox("sg-shopping-compare-price", t(lang, "comparePriceChart")),
      chartBox("sg-shopping-compare-share", t(lang, "compareShareChart"))
    ]);
  }

  function renderComparisonTable(lang, rows) {
    if (!rows.length) return "";
    return [
      '<section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "compareSummary")) + '</h2>',
      '<div class="mt-4 overflow-x-auto rounded-lg border border-slate-200">',
      '<table class="min-w-full divide-y divide-slate-200 text-sm">',
      '<thead class="bg-slate-50 text-xs font-black uppercase text-slate-500"><tr><th class="px-4 py-3 text-left">' + esc(t(lang, "category")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "products")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "p50")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "lowPriceShare")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "discount")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "metricDemand")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "metricCompetition")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "metricOpportunity")) + '</th><th class="px-4 py-3 text-left">' + esc(t(lang, "compareKeywords")) + '</th></tr></thead>',
      '<tbody class="divide-y divide-slate-100 bg-white">',
      rows.map((row) => [
        '<tr>',
        '<td class="px-4 py-3 font-black text-slate-950">' + esc(row.source_category || "-") + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums">' + esc(number(row.product_count || 0)) + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums font-black text-slate-950">' + esc(krw(row.median_price_krw || 0)) + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums">' + esc(pct(row.low_price_percent || 0)) + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums">' + esc(pct(row.discounted_percent || 0)) + '</td>',
        '<td class="px-4 py-3 text-right">' + scorePill(row.demand_score) + '</td>',
        '<td class="px-4 py-3 text-right">' + scorePill(row.competition_score) + '</td>',
        '<td class="px-4 py-3 text-right">' + scorePill(row.opportunity_score) + '</td>',
        '<td class="px-4 py-3 text-slate-600">' + esc((row.keywords || []).map((item) => item.keyword).filter(Boolean).join(", ") || "-") + '</td>',
        '</tr>'
      ].join("")).join(""),
      '</tbody></table></div>',
      '</section>'
    ].join("");
  }

  function renderComparisonProducts(lang, rows) {
    const visible = (rows || []).filter((row) => row.products && row.products.length);
    if (!visible.length) return "";
    const total = visible.reduce((sum, row) => sum + ((row.products && row.products.length) || 0), 0);
    return [
      '<section>',
      productListHeaderHTML(lang, t(lang, "compareProducts"), total),
      '<div class="grid grid-cols-1 gap-4 xl:grid-cols-2">',
      visible.map((row) => [
        '<section>',
        '<h3 class="text-base font-black text-slate-950">' + esc(row.source_category || "-") + '</h3>',
        '<div class="mt-3">',
        renderEvidenceProductGrid(lang, row.products),
        '</div>',
        '</section>'
      ].join("")).join(""),
      '</div>',
      '</section>'
    ].join("");
  }

  function renderComparisonDashboard(lang, baseRadar, rows, selectedSlugs, loading) {
    const analysisRadar = priceFilteredRadar(baseRadar, currentPriceRange());
    return [
      renderCategoryAxisStage(lang, baseRadar, "", selectedSlugs),
      renderAnalysisModeSwitch(lang, "category"),
      renderAnalysisPath(lang, "category", "", []),
      renderPriceBandCriteriaStage(lang, baseRadar, "", [], "category"),
      renderMarketOverviewStage(lang, analysisRadar, ""),
      renderStage(lang, "segmentStageTitle", "segmentStageDesc", [
        renderComparisonHero(lang, rows, loading),
        loading ? '' : renderComparisonChartsShell(lang),
        loading ? '' : renderComparisonTable(lang, rows)
      ].filter(Boolean).join('<div class="mt-6"></div>'), t(lang, "compareView")),
      loading ? '' : renderStage(lang, "evidenceStageTitle", "evidenceStageDesc", renderComparisonProducts(lang, rows) + '<div class="mt-6"></div>' + renderPolicies(lang, baseRadar && baseRadar.policy_notes), t(lang, "compareProducts"))
    ].join("");
  }

  function paintComparisonCharts(lang, rows) {
    const labels = (rows || []).map((row) => String(row.source_category || "-").slice(0, 14));
    paintChart("sg-shopping-compare-score", lang, rows && rows.length ? {
      color: ["#2563eb", "#f59e0b", "#dc2626"],
      tooltip: { trigger: "axis" },
      legend: { bottom: 0, textStyle: chartTextStyle() },
      grid: { left: 48, right: 16, top: 20, bottom: 58 },
      xAxis: { type: "category", data: labels, axisLabel: { ...chartTextStyle(), rotate: 15, interval: 0 } },
      yAxis: { type: "value", min: 0, max: 100, axisLabel: { formatter: "{value}" } },
      series: [
        { type: "bar", name: t(lang, "metricDemand"), data: rows.map((row) => Number(row.demand_score || 0)), barMaxWidth: 24, itemStyle: { borderRadius: [5, 5, 0, 0] } },
        { type: "line", name: t(lang, "metricCompetition"), data: rows.map((row) => Number(row.competition_score || 0)), smooth: true, symbolSize: 7 },
        { type: "bar", name: t(lang, "metricOpportunity"), data: rows.map((row) => Number(row.opportunity_score || 0)), barMaxWidth: 24, itemStyle: { borderRadius: [5, 5, 0, 0] } }
      ]
    } : null);

    paintChart("sg-shopping-compare-price", lang, rows && rows.length ? {
      color: ["#0f766e", "#94a3b8", "#7c3aed"],
      tooltip: { trigger: "axis" },
      legend: { bottom: 0, textStyle: chartTextStyle() },
      grid: { left: 62, right: 18, top: 20, bottom: 58 },
      xAxis: { type: "category", data: labels, axisLabel: { ...chartTextStyle(), rotate: 15, interval: 0 } },
      yAxis: { type: "value", name: "₩", axisLabel: { formatter: function (value) { return number(value); } } },
      series: [
        { type: "bar", name: t(lang, "p50"), data: rows.map((row) => Number(row.median_price_krw || 0)), barMaxWidth: 30, itemStyle: { borderRadius: [5, 5, 0, 0] } },
        { type: "line", name: t(lang, "p25"), data: rows.map((row) => Number(row.p25_price_krw || 0)), smooth: true, symbolSize: 7 },
        { type: "line", name: t(lang, "p75"), data: rows.map((row) => Number(row.p75_price_krw || 0)), smooth: true, symbolSize: 7 }
      ]
    } : null);

    paintChart("sg-shopping-compare-share", lang, rows && rows.length ? {
      color: ["#0f766e", "#f59e0b"],
      tooltip: { trigger: "axis" },
      legend: { bottom: 0, textStyle: chartTextStyle() },
      grid: { left: 48, right: 16, top: 20, bottom: 58 },
      xAxis: { type: "category", data: labels, axisLabel: { ...chartTextStyle(), rotate: 15, interval: 0 } },
      yAxis: { type: "value", min: 0, max: 100, axisLabel: { formatter: "{value}%" } },
      series: [
        { type: "bar", name: t(lang, "lowPriceShare"), data: rows.map((row) => Number(row.low_price_percent || 0)), barMaxWidth: 30, itemStyle: { borderRadius: [5, 5, 0, 0] } },
        { type: "bar", name: t(lang, "discount"), data: rows.map((row) => Number(row.discounted_percent || 0)), barMaxWidth: 30, itemStyle: { borderRadius: [5, 5, 0, 0] } }
      ]
    } : null);
  }

  function renderResearchDashboard(lang, radar, categoryAxisRadar) {
    const selected = window.__statgroundSelectedMarketCategory || "";
    const selectedSlugs = selected ? [selected] : [];
    const axisRadar = categoryAxisRadar || window.__statgroundBaseRadar || radar;
    const analysisRadar = priceFilteredRadar(radar, currentPriceRange());
    return [
      renderCategoryAxisStage(lang, axisRadar, selected, selectedSlugs),
      renderAnalysisModeSwitch(lang, "category"),
      renderAnalysisPath(lang, "category", selected, []),
      renderPriceBandCriteriaStage(lang, radar, selected, [], "category"),
      renderKeywordAxisStage(lang, analysisRadar, selected, []),
      renderMarketOverviewStage(lang, analysisRadar, selected),
      renderSegmentStage(lang, analysisRadar, selected, [], "category"),
      renderEvidenceStage(lang, analysisRadar, selected, [], "category")
    ].join("");
  }

  function intentButton(lang, value, active) {
    return '<button type="button" data-intent="' + esc(value) + '" class="rounded-lg border px-3 py-2 text-xs font-black ' + (active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400") + '">' + esc(t(lang, "intent_" + value)) + '</button>';
  }

  function renderHeadline(lang, finder) {
    const h = finder && finder.headline ? finder.headline : {};
    return [
      '<section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">',
      '<div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">',
      '<div>',
      '<h2 class="text-2xl font-black text-slate-950">' + esc(h.title || t(lang, "candidates")) + '</h2>',
      '<p class="mt-2 text-sm leading-6 text-slate-600">' + esc(h.summary || "") + '</p>',
      finder && finder.query && finder.query.intent === "seller" ? '<p class="mt-2 text-xs font-bold text-slate-500">' + esc(t(lang, "sellerFirst")) + '</p>' : '',
      '</div>',
      '<div class="grid grid-cols-2 gap-2 text-xs md:min-w-[300px]">',
      '<div class="rounded-lg bg-slate-50 p-3"><div class="font-bold text-slate-500">' + esc(t(lang, "budget")) + '</div><div class="mt-1 font-black text-slate-950">' + esc(krw(h.budget_krw || 0)) + '</div></div>',
      '<div class="rounded-lg bg-slate-50 p-3"><div class="font-bold text-slate-500">' + esc(t(lang, "confidence")) + '</div><div class="mt-1 font-black text-slate-950">' + esc(number(h.average_confidence_score || 0)) + '</div></div>',
      '</div>',
      '</div>',
      '</section>'
    ].join("");
  }

  function renderActions(lang, actions) {
    const rows = (actions || []).map((item) => [
      '<article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="text-sm font-black text-slate-950">' + esc(item.label || "") + '</div>',
      '<p class="mt-2 text-sm leading-6 text-slate-600">' + esc(item.detail || "") + '</p>',
      '</article>'
    ].join("")).join("");
    return '<section><h2 class="mb-3 text-lg font-black text-slate-950">' + esc(t(lang, "actions")) + '</h2><div class="grid grid-cols-1 gap-3 md:grid-cols-2">' + rows + '</div></section>';
  }

  function watchlist() {
    try {
      const parsed = JSON.parse(localStorage.getItem(watchKey) || "[]");
      return Array.isArray(parsed) ? parsed.filter((item) => item && item.product_code).slice(0, 30) : [];
    } catch (_) {
      return [];
    }
  }

  function saveWatch(item) {
    if (!item || !item.product_code) return;
    const key = itemKey(item);
    const rows = watchlist().filter((row) => itemKey(row) !== key);
    rows.unshift({
      product_code: item.product_code,
      product_name: typeof item.product_name === "string" ? item.product_name.trim() : "",
      product_label: productLabel(item),
      provider: providerKey(item),
      provider_label: providerLabel(item),
      image_url: imageURL(item),
      source_category: item.source_category || "",
      price_krw: Number(item.price_krw || 0),
      product_url: item.product_url || "",
      saved_at: new Date().toISOString()
    });
    localStorage.setItem(watchKey, JSON.stringify(rows.slice(0, 30)));
  }

  function removeWatch(code) {
    localStorage.setItem(watchKey, JSON.stringify(watchlist().filter((row) => itemKey(row) !== code)));
  }

  function watched(item) {
    const key = itemKey(item);
    return !!key && watchlist().some((row) => itemKey(row) === key);
  }

  function productViewMode() {
    try {
      return localStorage.getItem(productViewKey) === "large" ? "large" : "compact";
    } catch (_) {
      return "compact";
    }
  }

  function productGridClass() {
    return productViewMode() === "large"
      ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      : "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7";
  }

  function productViewButtonClass(active) {
    return "rounded-md px-3 py-1.5 text-xs font-black transition " + (active ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900");
  }

  function productViewControlsHTML(lang) {
    const mode = productViewMode();
    return [
      '<div class="flex items-center gap-2">',
      '<span class="text-xs font-black text-slate-500">' + esc(t(lang, "productViewMode")) + '</span>',
      '<div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">',
      '<button type="button" data-product-view-mode="compact" aria-pressed="' + (mode === "compact" ? "true" : "false") + '" class="' + productViewButtonClass(mode === "compact") + '">' + esc(t(lang, "compactView")) + '</button>',
      '<button type="button" data-product-view-mode="large" aria-pressed="' + (mode === "large" ? "true" : "false") + '" class="' + productViewButtonClass(mode === "large") + '">' + esc(t(lang, "largeView")) + '</button>',
      '</div>',
      '</div>'
    ].join("");
  }

  function productListHeaderHTML(lang, title, count) {
    return [
      '<div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(title) + '</h2>',
      '<div class="flex flex-wrap items-center gap-2">',
      Number.isFinite(Number(count)) ? '<span class="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">' + esc(number(count)) + ' ' + esc(t(lang, "products")) + '</span>' : '',
      productViewControlsHTML(lang),
      '</div>',
      '</div>'
    ].join("");
  }

  function resetProductDetailStore() {
    Object.keys(productDetailStore).forEach((key) => { delete productDetailStore[key]; });
    productDetailSeq = 0;
  }

  function registerProductDetailItem(item) {
    const key = itemKey(item) || "item:" + String(productDetailSeq += 1);
    productDetailStore[key] = item;
    return key;
  }

  function productDetailRowHTML(lang, key, value) {
    if (value == null || value === "") return "";
    return '<div class="flex min-w-0 justify-between gap-3"><dt class="shrink-0 font-bold text-slate-500">' + esc(t(lang, key)) + '</dt><dd class="min-w-0 break-words text-right font-black text-slate-950 [overflow-wrap:anywhere]">' + esc(value) + '</dd></div>';
  }

  function productDetailModalHTML(lang, item, detailKey) {
    const url = String(item && item.product_url ? item.product_url : "").trim();
    const code = item && item.product_code ? String(item.product_code) : "";
    const label = productLabel(item);
    const img = imageURL(item);
    const isWatched = watched(item);
    return [
      '<div class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/55 px-4 py-6" data-product-modal-close>',
      '<section class="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-4 shadow-2xl" role="dialog" aria-modal="true" aria-label="' + esc(t(lang, "productDetails")) + '">',
      '<div class="mb-3 flex items-start justify-between gap-3">',
      '<div class="min-w-0">',
      '<div class="mb-2">' + providerBadge(item, false) + '</div>',
      '<h2 class="min-w-0 break-words text-lg font-black leading-6 text-slate-950 [overflow-wrap:anywhere]">' + esc(label) + '</h2>',
      '</div>',
      '<button type="button" data-product-modal-close class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-black text-slate-600 hover:border-slate-400" aria-label="' + esc(t(lang, "closeDetails")) + '">&times;</button>',
      '</div>',
      '<div class="grid grid-cols-1 gap-4 md:grid-cols-[220px_minmax(0,1fr)]">',
      img ? '<div class="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50"><img src="' + esc(img) + '" alt="' + esc(label) + '" loading="lazy" referrerpolicy="no-referrer" class="max-h-full max-w-full object-contain"></div>' : '<div class="flex aspect-square w-full items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-xs font-bold text-slate-400">' + esc(t(lang, "products")) + '</div>',
      '<div class="min-w-0">',
      '<div class="mb-3 flex flex-wrap gap-1.5 text-[11px] font-bold text-slate-500">',
      item && item.source_category ? '<span class="max-w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 break-words [overflow-wrap:anywhere]">' + esc(item.source_category) + '</span>' : '',
      code ? '<span class="max-w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 break-words [overflow-wrap:anywhere]">' + esc(code) + '</span>' : '',
      '<span class="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 font-black text-emerald-700">' + esc(number(item && (item.deal_confidence_score || item.radar_score) || 0)) + '</span>',
      '</div>',
      '<dl class="grid gap-2 text-sm text-slate-600">',
      productDetailRowHTML(lang, "price", krw(item && item.price_krw)),
      productDetailRowHTML(lang, "priceBasisLabel", t(lang, "basis")),
      item && item.original_price_krw ? productDetailRowHTML(lang, "originalPrice", krw(item.original_price_krw)) : '',
      item && item.category_median_price_krw ? productDetailRowHTML(lang, "categoryMedian", krw(item.category_median_price_krw)) : '',
      item && item.reason ? productDetailRowHTML(lang, "reason", item.reason) : '',
      item && item.collected_at ? productDetailRowHTML(lang, "collected", item.collected_at) : '',
      '</dl>',
      '<div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">',
      detailKey ? '<button type="button" data-watch-code="' + esc(detailKey) + '" class="min-h-[40px] rounded-lg border border-slate-300 px-3 text-sm font-black text-slate-700 hover:border-slate-500">' + esc(isWatched ? t(lang, "savedWatch") : t(lang, "saveWatch")) + '</button>' : '',
      url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" class="inline-flex min-h-[40px] w-full items-center justify-center rounded-lg bg-slate-900 px-3 text-center text-sm font-black text-white hover:bg-slate-700">' + esc(t(lang, "source")) + '</a>' : '',
      '</div>',
      url ? '<div class="mt-3 flex justify-center"><img src="' + esc(ADPICK_LOGO_URL) + '" alt="Adpick" loading="lazy" class="h-[150px] w-[150px] object-contain"></div>' : '',
      '</div>',
      '</div>',
      '</section>',
      '</div>'
    ].join("");
  }

  function closeProductDetailModal(options) {
    const modal = document.getElementById("sg-shopping-product-modal");
    if (modal) modal.remove();
    const opts = options || {};
    if (opts.restoreURL && window.history && window.history.pushState && isProductDetailURL() && window.__statgroundProductReturnURL) {
      window.history.pushState({ statgroundShoppingProductClosed: true }, "", window.__statgroundProductReturnURL);
      window.__statgroundProductReturnURL = "";
    }
  }

  function openProductDetailModal(lang, key, options) {
    const item = productDetailStore[key];
    if (!item) return;
    const opts = options || {};
    if (opts.syncURL !== false) syncProductDetailURL(lang, item);
    closeProductDetailModal();
    const wrapper = document.createElement("div");
    wrapper.id = "sg-shopping-product-modal";
    wrapper.innerHTML = productDetailModalHTML(lang, item, key);
    document.body.appendChild(wrapper);
    wrapper.querySelectorAll("[data-product-modal-close]").forEach((el) => {
      el.addEventListener("click", function (event) {
        if (event.target !== el && !event.target.closest("button[data-product-modal-close]")) return;
        closeProductDetailModal({ restoreURL: true });
      });
    });
    function onKey(event) {
      if (event.key === "Escape") {
        closeProductDetailModal({ restoreURL: true });
        document.removeEventListener("keydown", onKey);
      }
    }
    document.addEventListener("keydown", onKey);
    bindWatchButtons(lang, [item], wrapper);
  }

  function productCard(lang, item) {
    const url = String(item && item.product_url ? item.product_url : "").trim();
    const code = item && item.product_code ? String(item.product_code) : "";
    const key = registerProductDetailItem(item);
    const isWatched = watched(item);
    const label = productLabel(item);
    const img = imageURL(item);
    if (productViewMode() !== "large") {
      return [
        '<article data-product-detail-key="' + esc(key) + '" role="button" tabindex="0" class="flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-2 shadow-sm transition hover:border-blue-300 hover:shadow-md">',
        '<div class="mb-2 flex h-16 w-full items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50">' + (img ? '<img src="' + esc(img) + '" alt="' + esc(label) + '" loading="lazy" referrerpolicy="no-referrer" class="max-h-full max-w-full object-contain">' : '') + '</div>',
        '<div class="mb-1 flex min-w-0 items-center justify-between gap-1.5">',
        '<span class="min-w-0">' + providerBadge(item, true) + '</span>',
        '<span class="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black text-emerald-700">' + esc(number(item && (item.deal_confidence_score || item.radar_score) || 0)) + '</span>',
        '</div>',
        '<h3 class="line-clamp-2 min-h-[2rem] min-w-0 break-words text-[11px] font-black leading-4 text-slate-950 [overflow-wrap:anywhere]">' + esc(label) + '</h3>',
        '<div class="mt-1 flex min-w-0 items-center justify-between gap-2">',
        '<span class="min-w-0 truncate text-xs font-black text-slate-950">' + esc(krw(item && item.price_krw)) + '</span>',
        '<button type="button" data-product-open-detail="' + esc(key) + '" class="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-600 hover:border-blue-300 hover:bg-blue-50">' + esc(t(lang, "openProductDetails")) + '</button>',
        '</div>',
        '</article>'
      ].join("");
    }
    return [
      '<article data-product-detail-key="' + esc(key) + '" role="button" tabindex="0" class="flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-300 hover:shadow-md">',
      img ? '<div class="mb-2 flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50"><img src="' + esc(img) + '" alt="' + esc(label) + '" loading="lazy" referrerpolicy="no-referrer" class="max-h-full max-w-full object-contain"></div>' : '',
      '<div class="flex items-start justify-between gap-2">',
      '<div class="min-w-0 flex-1">',
      '<div class="mb-1.5">' + providerBadge(item, false) + '</div>',
      '<h3 class="min-w-0 text-xs font-black leading-4 text-slate-950 break-words [overflow-wrap:anywhere]">' + esc(label) + '</h3>',
      '<div class="mt-1 flex flex-wrap gap-1 text-[10px] font-bold text-slate-500">',
      '<span class="max-w-full rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 break-words [overflow-wrap:anywhere]">' + esc(item && item.source_category ? item.source_category : "") + '</span>',
      code ? '<span class="max-w-full rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 break-words [overflow-wrap:anywhere]">' + esc(code) + '</span>' : '',
      '</div>',
      '</div>',
      '<span class="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-black text-emerald-700">' + esc(number(item && (item.deal_confidence_score || item.radar_score) || 0)) + '</span>',
      '</div>',
      '<dl class="mt-3 grid gap-1.5 text-[11px] text-slate-600">',
      '<div class="flex min-w-0 justify-between gap-3"><dt class="shrink-0 font-bold text-slate-500">' + esc(t(lang, "price")) + '</dt><dd class="min-w-0 break-words text-right font-black text-slate-950 [overflow-wrap:anywhere]">' + esc(krw(item && item.price_krw)) + '</dd></div>',
      '<div class="flex min-w-0 justify-between gap-3"><dt class="shrink-0 font-bold text-slate-500">' + esc(t(lang, "priceBasisLabel")) + '</dt><dd class="min-w-0 break-words text-right [overflow-wrap:anywhere]">' + esc(t(lang, "basis")) + '</dd></div>',
      item && item.original_price_krw ? '<div class="flex min-w-0 justify-between gap-3"><dt class="shrink-0 font-bold text-slate-500">' + esc(t(lang, "originalPrice")) + '</dt><dd class="min-w-0 break-words text-right [overflow-wrap:anywhere]">' + esc(krw(item.original_price_krw)) + '</dd></div>' : '',
      item && item.category_median_price_krw ? '<div class="flex min-w-0 justify-between gap-3"><dt class="shrink-0 font-bold text-slate-500">' + esc(t(lang, "categoryMedian")) + '</dt><dd class="min-w-0 break-words text-right [overflow-wrap:anywhere]">' + esc(krw(item.category_median_price_krw)) + '</dd></div>' : '',
      item && item.reason ? '<div class="flex min-w-0 justify-between gap-3"><dt class="shrink-0 font-bold text-slate-500">' + esc(t(lang, "reason")) + '</dt><dd class="min-w-0 break-words text-right [overflow-wrap:anywhere]">' + esc(item.reason) + '</dd></div>' : '',
      item && item.collected_at ? '<div class="flex min-w-0 justify-between gap-3"><dt class="shrink-0 font-bold text-slate-500">' + esc(t(lang, "collected")) + '</dt><dd class="min-w-0 break-words text-right [overflow-wrap:anywhere]">' + esc(item.collected_at) + '</dd></div>' : '',
      '</dl>',
      '<div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">',
      key ? '<button type="button" data-watch-code="' + esc(key) + '" class="min-h-[34px] min-w-0 rounded-lg border border-slate-300 px-2.5 py-1.5 text-center text-[11px] font-black leading-4 text-slate-700 break-words hover:border-slate-500 [overflow-wrap:anywhere]">' + esc(isWatched ? t(lang, "savedWatch") : t(lang, "saveWatch")) + '</button>' : '',
      url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" class="inline-flex min-h-[34px] min-w-0 items-center justify-center rounded-lg bg-slate-900 px-2.5 py-1.5 text-center text-[11px] font-black leading-4 text-white break-words hover:bg-slate-700 [overflow-wrap:anywhere]">' + esc(t(lang, "source")) + '</a>' : '',
      '</div>',
      '</article>'
    ].join("");
  }

  function renderCandidates(lang, items) {
    if (!items || !items.length) {
      return '<section class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">' + esc(t(lang, "noCandidates")) + '</section>';
    }
    return '<section>' + productListHeaderHTML(lang, t(lang, "candidates"), items.length) + '<div class="' + productGridClass() + '">' + items.map((item) => productCard(lang, item)).join("") + '</div></section>';
  }

  function renderObservedProducts(lang, radar, selectedCategory) {
    if (isPriceEvidenceLoading(radar)) return renderPriceEvidenceLoadingPanel(lang);
    const items = ((radar && radar.products) || []).length ? radar.products : ((radar && radar.deal_candidates) || []);
    if (!items.length) {
      return '<section class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">' + esc(t(lang, "categoryEmpty")) + '</section>';
    }
    const searchQuery = activeKeywordSearchQuery(radar);
    const title = (searchQuery ? searchQuery : (selectedCategory || t(lang, "allMarket"))) + " · " + t(lang, "categoryObservedProducts");
    return '<section>' + productListHeaderHTML(lang, title, items.length) + renderEvidenceProductGrid(lang, items) + '</section>';
  }

  function renderSeller(lang, items) {
    if (!items || !items.length) {
      return '<section class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">' + esc(t(lang, "noSeller")) + '</section>';
    }
    const rows = items.map((item) => [
      '<article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="flex items-start justify-between gap-3">',
      '<h3 class="text-sm font-black text-slate-950">' + esc(item.source_category || "-") + '</h3>',
      '<span class="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-black text-slate-700">' + esc(t(lang, "pressure_" + (item.competition_level || "watch"))) + '</span>',
      '</div>',
      '<div class="mt-3 grid grid-cols-3 gap-2 text-xs">',
      '<div class="rounded-lg bg-slate-50 p-2"><div class="font-bold text-slate-500">' + esc(t(lang, "median")) + '</div><div class="font-black text-slate-950">' + esc(krw(item.median_price_krw || 0)) + '</div></div>',
      '<div class="rounded-lg bg-slate-50 p-2"><div class="font-bold text-slate-500">' + esc(t(lang, "lowPrice")) + '</div><div class="font-black text-slate-950">' + esc(pct(item.low_price_percent || 0)) + '</div></div>',
      '<div class="rounded-lg bg-slate-50 p-2"><div class="font-bold text-slate-500">' + esc(t(lang, "discounted")) + '</div><div class="font-black text-slate-950">' + esc(pct(item.discounted_percent || 0)) + '</div></div>',
      '</div>',
      '<p class="mt-3 text-sm leading-6 text-slate-600">' + esc(item.recommended_action || "") + '</p>',
      '</article>'
    ].join("")).join("");
    return '<section><h2 class="mb-3 text-lg font-black text-slate-950">' + esc(t(lang, "seller")) + '</h2><div class="grid grid-cols-1 gap-4 lg:grid-cols-2">' + rows + '</div></section>';
  }

  function renderPolicies(lang, notes) {
    const rows = (notes || []).map((item) => '<span class="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600">' + esc(item.label || item.code || "") + ' · ' + esc(t(lang, "status_" + (item.status || "active"))) + '</span>').join("");
    return '<section><h2 class="mb-3 text-lg font-black text-slate-950">' + esc(t(lang, "policies")) + '</h2><div class="flex flex-wrap gap-2">' + rows + '</div></section>';
  }

  function renderWatchlist(lang) {
    const rows = watchlist();
    if (!rows.length) {
      return '<section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "watchlist")) + '</h2><p class="mt-3 text-sm text-slate-500">' + esc(t(lang, "noWatchlist")) + '</p></section>';
    }
    return [
      '<section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "watchlist")) + '</h2>',
      '<div class="mt-3 grid gap-2">',
      rows.map((item) => [
        '<div class="flex flex-col gap-2 rounded-lg bg-slate-50 p-3 text-xs sm:flex-row sm:items-center sm:justify-between">',
        '<div class="flex min-w-0 items-center gap-3">',
        imageURL(item) ? '<div class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-white"><img src="' + esc(imageURL(item)) + '" alt="' + esc(productLabel(item)) + '" loading="lazy" referrerpolicy="no-referrer" class="max-h-full max-w-full object-contain"></div>' : '',
        '<div class="min-w-0 flex-1"><div class="mb-1">' + providerBadge(item, true) + '</div><div class="min-w-0 break-words font-black text-slate-900 [overflow-wrap:anywhere]">' + esc(productLabel(item)) + '</div><div class="mt-1 min-w-0 break-words text-slate-500 [overflow-wrap:anywhere]">' + esc(item.source_category || "") + ' · ' + esc(krw(item.price_krw || 0)) + '</div></div>',
        '</div>',
        '<div class="flex shrink-0 gap-2">',
        item.product_url ? '<a class="inline-flex min-h-[34px] min-w-0 items-center rounded-lg bg-slate-900 px-3 text-center font-black leading-4 text-white break-words [overflow-wrap:anywhere]" href="' + esc(item.product_url) + '" target="_blank" rel="noopener noreferrer">' + esc(t(lang, "source")) + '</a>' : '',
        '<button type="button" data-remove-watch="' + esc(itemKey(item)) + '" class="min-h-[34px] min-w-0 rounded-lg border border-slate-300 px-3 text-center font-black leading-4 text-slate-600 break-words [overflow-wrap:anywhere]">' + esc(t(lang, "removeWatch")) + '</button>',
        '</div>',
        '</div>'
      ].join("")).join(""),
      '</div>',
      '</section>'
    ].join("");
  }

  function renderChartsShell(lang, selectedCategory) {
    const scoped = Boolean(selectedCategory);
    return chartRailHTML(lang, [
      chartBox("sg-shopping-chart-price", t(lang, "chartPrice")),
      chartBox("sg-shopping-chart-category", scoped ? t(lang, "chartKeywordCategory") : t(lang, "chartCategory")),
      chartBox("sg-shopping-chart-candidates", scoped ? t(lang, "chartKeywordCandidates") : t(lang, "chartCandidates")),
      chartBox("sg-shopping-chart-seller", scoped ? t(lang, "chartKeywordSeller") : t(lang, "chartSeller"))
    ]);
  }

  function renderFinderResult(lang, finder) {
    const sellerFirst = finder && finder.query && finder.query.intent === "seller";
    const selectedMarketCategory = window.__statgroundSelectedMarketCategory || "";
    return [
      renderHeadline(lang, finder),
      '<div class="mt-6">',
      renderChartsShell(lang, selectedMarketCategory),
      '</div>',
      sellerFirst ? '<div class="mt-6">' + renderSeller(lang, finder && finder.seller_opportunities) + '</div>' : '',
      '<div class="mt-6">',
      renderActions(lang, finder && finder.next_actions),
      '</div>',
      '<div class="mt-6">',
      renderCandidates(lang, finder && finder.candidates),
      '</div>',
      !sellerFirst ? '<div class="mt-6">' + renderSeller(lang, finder && finder.seller_opportunities) + '</div>' : '',
      '<div class="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.5fr]">',
      renderWatchlist(lang),
      renderPolicies(lang, finder && finder.policy_notes),
      '</div>'
    ].join("");
  }

  function bucketPrices(items) {
    const buckets = [
      { label: "<=5k", min: 0, max: 5000, count: 0 },
      { label: "5k-10k", min: 5001, max: 10000, count: 0 },
      { label: "10k-30k", min: 10001, max: 30000, count: 0 },
      { label: "30k-50k", min: 30001, max: 50000, count: 0 },
      { label: "50k-100k", min: 50001, max: 100000, count: 0 },
      { label: "100k+", min: 100001, max: Infinity, count: 0 }
    ];
    (items || []).forEach((item) => {
      const price = Number(item && item.price_krw || 0);
      if (!Number.isFinite(price) || price <= 0) return;
      const bucket = buckets.find((row) => price >= row.min && price <= row.max);
      if (bucket) bucket.count += 1;
    });
    return buckets;
  }

  function priceBands(radar, candidates) {
    const bands = radar && Array.isArray(radar.price_bands) ? radar.price_bands.filter((row) => row && row.label) : [];
    if (bands.length) {
      const bandRows = bands.map((row) => ({
        label: row.label,
        count: Number(row.product_count || row.count || 0)
      }));
      if (bandRows.reduce((sum, row) => sum + Number(row.count || 0), 0) > 0) return bandRows;
    }
    const candidateBuckets = bucketPrices(candidates);
    if (candidateBuckets.reduce((sum, row) => sum + Number(row.count || 0), 0) > 0) return candidateBuckets;
    return bucketPrices((radar && radar.products) || []);
  }

  function majorKeywordRows(radar, selectedCategory) {
    if (!selectedCategory) return [];
    let rows = scopedCategoryKeywordRows(radar, selectedCategory);
    if (activeKeywordSearchQuery(radar)) {
      rows = keywordSearchFocusedRows(radar, rows);
      if (!rows.length) rows = keywordSearchFallbackRows(radar);
    }
    return rows
      .slice()
      .sort((a, b) => {
        const productDelta = Number(b.product_count || 0) - Number(a.product_count || 0);
        if (productDelta) return productDelta;
        return Number(b.opportunity_score || 0) - Number(a.opportunity_score || 0);
      })
      .slice(0, 8)
      .map((row) => ({
        source_category: row.keyword || "-",
        keyword: row.keyword || "",
        product_count: Number(row.product_count || 0),
        p25_price_krw: Number(row.p25_price_krw || 0),
        median_price_krw: Number(row.median_price_krw || 0),
        p75_price_krw: Number(row.p75_price_krw || 0),
        iqr_price_krw: Number(row.iqr_price_krw || 0),
        demand_score: Number(row.demand_score || 0),
        competition_score: Number(row.competition_score || 0),
        opportunity_score: Number(row.opportunity_score || 0),
        price_gap_score: Number(row.price_gap_score || 0),
        source_market_category: row.source_category || selectedCategory
      }));
  }

  function disposeChart(id) {
    if (!chartRegistry[id]) return;
    try { chartRegistry[id].dispose(); } catch (_) {}
    delete chartRegistry[id];
  }

  function paintChart(id, lang, option, emptyTitleKey, emptyDetailKey) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!option) {
      disposeChart(id);
      emptyChart(el, lang, emptyTitleKey || "chartEmpty", emptyDetailKey || "chartEmptyHint");
      return;
    }
    loadECharts().then((echarts) => {
      if (!document.body.contains(el)) return;
      disposeChart(id);
      el.innerHTML = "";
      chartRegistry[id] = echarts.init(el, null, { renderer: "canvas" });
      chartRegistry[id].setOption(option, true);
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(() => {
          if (chartRegistry[id]) chartRegistry[id].resize();
        });
      }
    }).catch(() => {
      disposeChart(id);
      emptyChart(el, lang, "chartRenderError", "chartEmptyHint");
    });
  }

  function chartTextStyle() {
    return { color: "#334155", fontFamily: "Inter, system-ui, sans-serif" };
  }

  function markChartsUnavailable(lang, ids) {
    (ids || []).forEach((id) => {
      disposeChart(id);
      emptyChart(document.getElementById(id), lang, "chartRenderError", "chartEmptyHint");
    });
  }

  function renderInsightCharts(lang, radar, finder) {
    const selected = window.__statgroundSelectedMarketCategory || "";
    let chartRows = scopedCategoryKeywordRows(radar, selected);
    if (activeKeywordSearchQuery(radar)) {
      chartRows = keywordSearchFocusedRows(radar, chartRows);
      if (!chartRows.length && selected) chartRows = keywordSearchFallbackRows(radar);
    }
    const crossPoints = chartRows
      .map((item) => ({
      source_category: item.source_category || "",
      keyword: item.keyword || "",
      price_krw: Number(item.median_price_krw || 0),
      deal_confidence_score: Number(item.opportunity_score || 0),
      radar_score: Number(item.opportunity_score || 0),
      discount_percent: Number(item.price_gap_score || 0),
      below_category_median_percent: 0
    }));
    const radarCandidates = crossPoints.length ? crossPoints : (selected ? [] : ((radar && radar.deal_candidates) || []));
    const candidates = radarCandidates.length ? radarCandidates : ((finder && finder.candidates) || []);
    const radarCategories = (radar && radar.categories) || [];
    const keywordRows = majorKeywordRows(radar, selected);
    const visibleCategories = selected ? keywordRows : radarCategories;
    const categories = visibleCategories.length ? visibleCategories : ((finder && finder.category_options) || []);
    const radarSellers = (radar && radar.seller_insights) || [];
    const visibleSellers = selected ? keywordRows : radarCategories;
    const sellers = visibleSellers.length ? visibleSellers : (radarSellers.length ? radarSellers : ((finder && finder.seller_opportunities) || []));
    const buckets = priceBands(radar, candidates);
    const bucketTotal = buckets.reduce((sum, row) => sum + Number(row.count || 0), 0);

    paintChart("sg-shopping-chart-price", lang, bucketTotal > 0 ? {
      color: ["#0f766e"],
      tooltip: { trigger: "axis" },
      grid: { left: 56, right: 16, top: 22, bottom: 40 },
      xAxis: { type: "category", data: buckets.map((row) => row.label), axisLabel: chartTextStyle() },
      yAxis: { type: "value", minInterval: 1, axisLabel: chartTextStyle() },
      series: [{ type: "bar", name: t(lang, "products"), data: buckets.map((row) => row.count), barMaxWidth: 44, itemStyle: { borderRadius: [6, 6, 0, 0] } }]
    } : null);

    paintChart("sg-shopping-chart-category", lang, categories.length ? {
      color: ["#2563eb", "#f59e0b"],
      tooltip: { trigger: "axis" },
      legend: { bottom: 0, textStyle: chartTextStyle() },
      dataZoom: categories.length > 8 ? [{ type: "inside" }, { type: "slider", height: 16, bottom: 32 }] : [],
      grid: { left: 48, right: 16, top: 20, bottom: categories.length > 8 ? 82 : 58 },
      xAxis: { type: "category", data: categories.map((row) => String(row.source_category || "-").slice(0, 12)), axisLabel: { ...chartTextStyle(), rotate: 25, interval: 0 } },
      yAxis: { type: "value", min: 0, max: 100, axisLabel: { formatter: "{value}" } },
      series: [
        { type: "bar", name: t(lang, "metricDemand"), data: categories.map((row) => Number(row.demand_score || 0)), barMaxWidth: 24, itemStyle: { borderRadius: [5, 5, 0, 0] } },
        { type: "line", name: t(lang, "metricCompetition"), data: categories.map((row) => Number(row.competition_score || 0)), smooth: true, symbolSize: 7 }
      ]
    } : null);

    paintChart("sg-shopping-chart-candidates", lang, selected && keywordRows.length ? {
      color: ["#7c3aed", "#94a3b8", "#0f766e", "#f59e0b"],
      tooltip: {
        trigger: "axis",
        formatter: function (params) {
          const rows = Array.isArray(params) ? params : [];
          const first = rows[0] && rows[0].data && rows[0].data.raw ? rows[0].data.raw : {};
          const lines = ['<b>' + esc(first.keyword || first.source_category || "-") + '</b>'];
          lines.push(esc(t(lang, "p25")) + ": " + esc(krw(first.p25_price_krw || 0)));
          lines.push(esc(t(lang, "p50")) + ": " + esc(krw(first.median_price_krw || 0)));
          lines.push(esc(t(lang, "p75")) + ": " + esc(krw(first.p75_price_krw || 0)));
          lines.push(esc(t(lang, "metricGap")) + ": " + esc(number(first.price_gap_score || 0)));
          return lines.join("<br>");
        }
      },
      legend: { bottom: 0, textStyle: chartTextStyle() },
      grid: { left: 62, right: 52, top: 20, bottom: 76 },
      xAxis: { type: "category", data: keywordRows.map((row) => String(row.source_category || "-").slice(0, 12)), axisLabel: { ...chartTextStyle(), rotate: 25, interval: 0 } },
      yAxis: [
        { type: "value", name: "₩", axisLabel: { formatter: function (value) { return number(value); } } },
        { type: "value", name: t(lang, "metricGap"), min: 0, max: 100, axisLabel: { formatter: "{value}" } }
      ],
      series: [
        {
          type: "bar",
          name: t(lang, "p50"),
          yAxisIndex: 0,
          data: keywordRows.map((row) => ({ value: Number(row.median_price_krw || 0), raw: row })),
          barMaxWidth: 24,
          itemStyle: { borderRadius: [5, 5, 0, 0] }
        },
        {
          type: "line",
          name: t(lang, "p25"),
          yAxisIndex: 0,
          data: keywordRows.map((row) => Number(row.p25_price_krw || 0)),
          smooth: true,
          symbolSize: 7
        },
        {
          type: "line",
          name: t(lang, "p75"),
          yAxisIndex: 0,
          data: keywordRows.map((row) => Number(row.p75_price_krw || 0)),
          smooth: true,
          symbolSize: 7
        },
        {
          type: "line",
          name: t(lang, "metricGap"),
          yAxisIndex: 1,
          data: keywordRows.map((row) => Number(row.price_gap_score || 0)),
          smooth: true,
          symbolSize: 7
        }
      ]
    } : candidates.length ? {
      color: ["#7c3aed"],
      tooltip: {
        trigger: "item",
        formatter: function (params) {
          const item = params.data && params.data.raw ? params.data.raw : {};
          const label = [item.source_category || "Gmarket", item.keyword || ""].filter(Boolean).join(" · ");
          return esc(label) + "<br>" + esc(t(lang, "price")) + ": " + esc(krw(item.price_krw || 0)) + "<br>" + esc(t(lang, "metricOpportunity")) + ": " + esc(number(item.deal_confidence_score || item.radar_score || 0));
        }
      },
      grid: { left: 56, right: 16, top: 20, bottom: 42 },
      xAxis: { type: "value", name: "₩", axisLabel: { formatter: function (value) { return number(value); } } },
      yAxis: { type: "value", name: t(lang, "confidence"), min: 0, max: 100 },
      series: [{
        type: "scatter",
        symbolSize: function (data) { return Math.max(10, Math.min(34, Number(data[2] || 0) / 3)); },
        data: candidates.slice(0, 96).map((item) => ({
          value: [Number(item.price_krw || 0), Number(item.deal_confidence_score || item.radar_score || 0), Number(item.discount_percent || 0) + Number(item.below_category_median_percent || 0)],
          raw: item
        }))
      }]
    } : null);

    paintChart("sg-shopping-chart-seller", lang, sellers.length ? {
      color: ["#dc2626"],
      tooltip: { trigger: "axis" },
      dataZoom: sellers.length > 8 ? [{ type: "inside", yAxisIndex: 0 }, { type: "slider", yAxisIndex: 0, width: 16, right: 0 }] : [],
      grid: { left: 64, right: sellers.length > 8 ? 38 : 18, top: 20, bottom: 48 },
      xAxis: { type: "value", axisLabel: { formatter: "{value}" } },
      yAxis: { type: "category", data: sellers.map((row) => String(row.source_category || "-").slice(0, 14)), axisLabel: chartTextStyle() },
      series: [{
        type: "bar",
        name: t(lang, "opportunity"),
        data: sellers.map((row) => Number(row.opportunity_score || Math.round((Number(row.low_price_percent || 0) * 1.3 + Number(row.discounted_percent || 0) + Math.min(Number(row.product_count || 0), 30)) * 10) / 10)),
        barMaxWidth: 22,
        itemStyle: { borderRadius: [0, 6, 6, 0] }
      }]
    } : null);
  }

  function bindWatchButtons(lang, currentItems, root) {
    const scope = root || document;
    const map = {};
    (currentItems || []).forEach((item) => {
      const key = itemKey(item);
      if (key) map[key] = item;
    });
    scope.querySelectorAll("[data-watch-code]").forEach((btn) => {
      if (btn.getAttribute("data-watch-bound")) return;
      btn.setAttribute("data-watch-bound", "1");
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        const code = btn.getAttribute("data-watch-code");
        saveWatch(map[code] || productDetailStore[code]);
        btn.textContent = t(lang, "savedWatch");
        const result = document.getElementById("sg-shopping-category-result") || document.getElementById("sg-shopping-finder-result");
        if (result && window.__statgroundLastFinder) {
          result.innerHTML = renderCategoryResult(lang, window.__statgroundLastFinder, window.__statgroundSelectedCategory || "");
          afterShoppingRender(lang, document.getElementById("sg-shopping-app") || document);
        }
      });
    });
    scope.querySelectorAll("[data-remove-watch]").forEach((btn) => {
      if (btn.getAttribute("data-watch-bound")) return;
      btn.setAttribute("data-watch-bound", "1");
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        removeWatch(btn.getAttribute("data-remove-watch"));
        const result = document.getElementById("sg-shopping-category-result") || document.getElementById("sg-shopping-finder-result");
        if (result && window.__statgroundLastFinder) {
          result.innerHTML = renderCategoryResult(lang, window.__statgroundLastFinder, window.__statgroundSelectedCategory || "");
          afterShoppingRender(lang, document.getElementById("sg-shopping-app") || document);
        }
      });
    });
  }

  function bindProductDetailCards(lang, root) {
    const scope = root || document;
    scope.querySelectorAll("[data-product-open-detail]").forEach((btn) => {
      if (btn.getAttribute("data-detail-bound")) return;
      btn.setAttribute("data-detail-bound", "1");
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        openProductDetailModal(lang, btn.getAttribute("data-product-open-detail") || "");
      });
    });
    scope.querySelectorAll("[data-product-detail-key]").forEach((card) => {
      if (card.getAttribute("data-detail-bound")) return;
      card.setAttribute("data-detail-bound", "1");
      card.addEventListener("click", function (event) {
        if (event.target && event.target.closest && event.target.closest("a,button,input,select,textarea,label")) return;
        openProductDetailModal(lang, card.getAttribute("data-product-detail-key") || "");
      });
      card.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        openProductDetailModal(lang, card.getAttribute("data-product-detail-key") || "");
      });
    });
  }

  function bindProductViewControls(lang, appEl) {
    const scope = appEl || document;
    scope.querySelectorAll("[data-product-view-mode]").forEach((btn) => {
      if (btn.getAttribute("data-product-view-bound")) return;
      btn.setAttribute("data-product-view-bound", "1");
      btn.addEventListener("click", function () {
        const mode = btn.getAttribute("data-product-view-mode") === "large" ? "large" : "compact";
        try { localStorage.setItem(productViewKey, mode); } catch (_) {}
        const radar = window.__statgroundLastRadar;
        const target = document.getElementById("sg-shopping-app");
        if (radar && target) renderLoadedRadar(lang, radar, target);
      });
    });
  }

  function maybeOpenProductDetailFromURL(lang) {
    const target = productDetailTargetFromURL();
    if (!target) return;
    const key = target.provider + ":" + target.product_code;
    const currentPath = window.location.pathname || "";
    if (window.__statgroundOpenedProductPath === currentPath && document.getElementById("sg-shopping-product-modal")) return;
    if (productDetailStore[key]) {
      window.__statgroundOpenedProductPath = currentPath;
      openProductDetailModal(lang, key, { syncURL: false });
      return;
    }
    fetchJSONWithRetry(apiURL(lang, "ajax_detail_product", { provider: target.provider, product_code: target.product_code }), 2)
      .then((res) => {
        const item = res && res.json && res.json.found ? res.json.item : null;
        if (!item || !item.product_code) return;
        const detailKey = registerProductDetailItem(item);
        window.__statgroundOpenedProductPath = currentPath;
        openProductDetailModal(lang, detailKey, { syncURL: false });
      })
      .catch(function () {});
  }

  function setupChartRails(appEl) {
    const scope = appEl || document;
    scope.querySelectorAll("[data-chart-rail]").forEach((rail) => {
      const track = rail.querySelector("[data-chart-rail-track]");
      if (!track) return;
      const prev = rail.querySelector("[data-chart-rail-prev]");
      const next = rail.querySelector("[data-chart-rail-next]");
      function syncRailControls() {
        const count = Number(rail.getAttribute("data-chart-count") || 0);
        const fitMin = count <= 2 ? 360 : 0;
        const canFit = count > 0 && count <= 2 && track.clientWidth / count >= fitMin;
        rail.setAttribute("data-chart-fit", canFit ? "1" : "0");
        const overflow = !canFit && track.scrollWidth - track.clientWidth > 6;
        [prev, next].forEach((btn) => {
          if (!btn) return;
          btn.classList.toggle("hidden", !overflow);
          btn.classList.toggle("flex", overflow);
        });
        if (!overflow) return;
        const maxLeft = Math.max(0, track.scrollWidth - track.clientWidth - 6);
        const atStart = track.scrollLeft <= 6;
        const atEnd = track.scrollLeft >= maxLeft;
        if (prev) {
          prev.disabled = atStart;
          prev.classList.toggle("opacity-40", atStart);
          prev.classList.toggle("cursor-not-allowed", atStart);
        }
        if (next) {
          next.disabled = atEnd;
          next.classList.toggle("opacity-40", atEnd);
          next.classList.toggle("cursor-not-allowed", atEnd);
        }
      }
      function scrollByPage(direction) {
        track.scrollBy({ left: direction * Math.max(240, Math.round(track.clientWidth)), behavior: "smooth" });
        setTimeout(syncRailControls, 260);
      }
      if (prev && !prev.getAttribute("data-chart-rail-bound")) {
        prev.setAttribute("data-chart-rail-bound", "1");
        prev.addEventListener("click", function () { scrollByPage(-1); });
      }
      if (next && !next.getAttribute("data-chart-rail-bound")) {
        next.setAttribute("data-chart-rail-bound", "1");
        next.addEventListener("click", function () { scrollByPage(1); });
      }
      if (!track.getAttribute("data-chart-wheel-bound")) {
        track.setAttribute("data-chart-wheel-bound", "1");
        track.addEventListener("wheel", function (event) {
          if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
          event.preventDefault();
          track.scrollLeft += event.deltaY;
        }, { passive: false });
      }
      if (!track.getAttribute("data-chart-scroll-bound")) {
        track.setAttribute("data-chart-scroll-bound", "1");
        track.addEventListener("scroll", function () {
          if (window.requestAnimationFrame) window.requestAnimationFrame(syncRailControls);
          else syncRailControls();
        });
      }
      if (window.ResizeObserver && !rail.__sgChartRailObserver) {
        rail.__sgChartRailObserver = new ResizeObserver(syncRailControls);
        rail.__sgChartRailObserver.observe(track);
      } else if (!rail.getAttribute("data-chart-resize-bound")) {
        rail.setAttribute("data-chart-resize-bound", "1");
        window.addEventListener("resize", syncRailControls);
      }
      syncRailControls();
    });
  }

  function afterShoppingRender(lang, appEl) {
    bindProductViewControls(lang, appEl);
    bindProductDetailCards(lang, appEl);
    setupChartRails(appEl);
    setupEvidenceProductPagination(appEl);
    setupKeywordProductPagination(appEl);
    bindWatchButtons(lang, [], appEl);
    maybeOpenProductDetailFromURL(lang);
  }

  function bindFinder(lang, radar) {
    const form = document.getElementById("sg-shopping-finder-form");
    const resultEl = document.getElementById("sg-shopping-finder-result");
    if (!form || !resultEl) return;
    let selectedIntent = "budget";
    function syncIntentButtons() {
      document.querySelectorAll("#sg-shopping-intents [data-intent]").forEach((btn) => {
        const active = btn.getAttribute("data-intent") === selectedIntent;
        btn.className = "rounded-lg border px-3 py-2 text-xs font-black " + (active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400");
      });
    }
    document.querySelectorAll("#sg-shopping-intents [data-intent]").forEach((btn) => {
      btn.addEventListener("click", function () {
        selectedIntent = btn.getAttribute("data-intent") || "budget";
        syncIntentButtons();
      });
    });
    function submit() {
      const budget = String(document.getElementById("sg-shopping-budget").value || "30000").replace(/,/g, "");
      const category = document.getElementById("sg-shopping-category").value || "";
      const query = document.getElementById("sg-shopping-query").value || "";
      resultEl.innerHTML = '<div class="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">' + esc(t(lang, "finding")) + '</div>';
      fetchJSONWithRetry(apiURL(lang, "ajax_find_gmarket", { budget_krw: budget, category: category, q: query, intent: selectedIntent }), 2)
        .then((res) => {
          if (!res || !res.ok) throw new Error("finder_failed");
          window.__statgroundLastFinder = res.json && res.json.finder ? res.json.finder : {};
          resultEl.innerHTML = renderFinderResult(lang, window.__statgroundLastFinder);
          renderInsightCharts(lang, priceFilteredRadar(radar, currentPriceRange()), window.__statgroundLastFinder);
          afterShoppingRender(lang, document.getElementById("sg-shopping-app") || resultEl);
        })
        .catch(function () {
          resultEl.innerHTML = '<div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">' + esc(t(lang, "finderError")) + '</div>';
        });
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      submit();
    });
    submit();
  }

  function bindCategoryDeck(lang, radar) {
    const deckEl = document.getElementById("sg-shopping-category-deck");
    const resultEl = document.getElementById("sg-shopping-category-result");
    if (!deckEl || !resultEl) return;
    function setSelected(category) {
      window.__statgroundSelectedCategory = category || "";
      deckEl.innerHTML = renderCategoryDeck(lang, radar, window.__statgroundSelectedCategory);
      bindCategoryDeck(lang, radar);
    }
    function loadCategory(category) {
      setSelected(category);
      resultEl.innerHTML = '<div class="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">' + esc(t(lang, "loadingCategory")) + '</div>';
      fetchJSONWithRetry(apiURL(lang, "ajax_find_gmarket", { budget_krw: "5000000", category: category, q: "", intent: "budget" }), 2)
        .then((res) => {
          if (!res || !res.ok) throw new Error("finder_failed");
        window.__statgroundLastFinder = res.json && res.json.finder ? res.json.finder : {};
        resultEl.innerHTML = renderCategoryResult(lang, window.__statgroundLastFinder, category);
        afterShoppingRender(lang, document.getElementById("sg-shopping-app") || resultEl);
        })
        .catch(function () {
          resultEl.innerHTML = '<div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">' + esc(t(lang, "finderError")) + '</div>';
        });
    }
    deckEl.querySelectorAll("[data-shopping-category]").forEach((btn) => {
      btn.addEventListener("click", function () {
        loadCategory(btn.getAttribute("data-shopping-category") || "");
      });
    });
  }

  function bindResearchDashboard(lang, radar, appEl) {
    if (!appEl) return;
    function selectCategory(category, options) {
      const opts = options || {};
      if (opts.skipURL) {
        window.__statgroundSelectedMarketCategory = category || "";
        const analysisRadar = priceFilteredRadar(radar, currentPriceRange());
        appEl.innerHTML = renderResearchDashboard(lang, radar, window.__statgroundBaseRadar || radar);
        renderInsightCharts(lang, analysisRadar, null);
        paintCategoryKeywordLensCharts(lang, categoryKeywordLensRows(analysisRadar, window.__statgroundSelectedMarketCategory || ""));
        bindResearchDashboard(lang, radar, appEl);
        bindPriceBandCriteria(lang, appEl);
        setupShoppingFilters(appEl);
        setupKeywordMartSearch(lang, radar, appEl, "category");
        afterShoppingRender(lang, appEl);
        return;
      }
      window.location.href = categoryHref(lang, category || "");
    }
    function toggleCompareCategory(category) {
      const slug = normalizedCategorySlug(category || "");
      if (!slug) {
        window.location.href = shoppingBasePath(lang);
        return;
      }
      const current = selectedCategorySlugs();
      const exists = current.indexOf(slug) >= 0;
      const next = exists ? current.filter((item) => item !== slug) : current.concat([slug]);
      window.location.href = compareHref(lang, next);
    }
    appEl.querySelectorAll("[data-top-category]").forEach((btn) => {
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        toggleCompareCategory(btn.getAttribute("data-top-category") || "");
      });
    });
    appEl.querySelectorAll("[data-market-category]").forEach((btn) => {
      if (btn.form && String(btn.form.method || "").toLowerCase() === "post") return;
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        const category = btn.getAttribute("data-market-category") || "";
        selectCategory(category);
      });
    });
    setupKeywordTableTabs(appEl);
  }

  function filterButtonClass(active) {
    return "rounded-md px-3 py-2 text-xs font-black " + (active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500");
  }

  function shouldFetchPriceEvidence() {
    return analysisModeFromURL() !== "keyword" && compareSlugsFromURL().length <= 1;
  }

  function fetchPriceRangeEvidence(lang, appEl, rawRange, category) {
    const range = normalizePriceRange(rawRange);
    if (!range || !appEl || !shouldFetchPriceEvidence()) return;
    const selectedCategory = category || currentPriceEvidenceCategory(window.__statgroundBaseRadar || window.__statgroundLastRadar);
    const key = priceEvidenceKey(range, selectedCategory);
    window.__statgroundPriceEvidenceRequestKey = key;
    fetchJSONWithRetry(apiURL(lang, "ajax_price_products_gmarket", priceEvidenceQueryParams(range, selectedCategory)), 2)
      .then((res) => {
        if (window.__statgroundPriceEvidenceRequestKey !== key) return;
        const currentRange = currentPriceRange();
        if (!currentRange || priceEvidenceKey(currentRange, selectedCategory) !== key) return;
        const items = res && res.ok && res.json && Array.isArray(res.json.items) ? res.json.items : [];
        const baseRadar = window.__statgroundBaseRadar || window.__statgroundLastRadar || {};
        const nextRadar = Object.assign({}, baseRadar, {
          products: items,
          deal_candidates: [],
          __sg_price_evidence_key: key,
          __sg_price_evidence_loading: ""
        });
        renderLoadedRadar(lang, nextRadar, appEl, {
          baseRadar: baseRadar,
          defaultCategory: selectedCategory
        });
      })
      .catch(() => {
        if (window.__statgroundPriceEvidenceRequestKey !== key) return;
        const baseRadar = window.__statgroundBaseRadar || window.__statgroundLastRadar || {};
        const nextRadar = Object.assign({}, baseRadar, {
          __sg_price_evidence_loading: "",
          __sg_price_evidence_error: key
        });
        renderLoadedRadar(lang, nextRadar, appEl, {
          baseRadar: baseRadar,
          defaultCategory: selectedCategory
        });
      });
  }

  function bindPriceBandCriteria(lang, appEl) {
    if (!appEl) return;
    const status = appEl.querySelector("#sg-shopping-price-band-status");
    const minInput = appEl.querySelector("[data-price-range-min]");
    const maxInput = appEl.querySelector("[data-price-range-max]");
    const sliderMin = appEl.querySelector("[data-price-range-slider-min]");
    const sliderMax = appEl.querySelector("[data-price-range-slider-max]");
    const sliderTrack = appEl.querySelector("[data-price-range-slider-track]");
    const sliderLabel = appEl.querySelector("[data-price-range-slider-label]");
    const boundaryEl = appEl.querySelector("[data-price-range-boundaries]");
    const sliderBoundaries = priceRangeBoundariesFromData(boundaryEl && boundaryEl.getAttribute("data-price-range-boundaries"));
    function rerender() {
      const radar = window.__statgroundLastRadar;
      if (radar) renderLoadedRadar(lang, radar, appEl, {
        baseRadar: window.__statgroundBaseRadar || radar,
        defaultCategory: window.__statgroundDefaultMarketCategory || ""
      });
    }
    function setPriceRange(raw) {
      const normalized = normalizePriceRange(raw);
      window.__statgroundSelectedPriceRange = normalized;
      window.__statgroundSelectedPriceBandKey = normalized ? normalized.key : "all";
      window.__statgroundSelectedPriceBandLabel = priceRangeLabel(lang, normalized);
      window.__statgroundPriceEvidenceRequestKey = normalized ? window.__statgroundPriceEvidenceRequestKey : "";
      if (!normalized && shouldFetchPriceEvidence()) {
        window.__statgroundLastRadar = window.__statgroundBaseRadar || window.__statgroundLastRadar;
      }
      if (normalized && shouldFetchPriceEvidence()) {
        const category = currentPriceEvidenceCategory(window.__statgroundBaseRadar || window.__statgroundLastRadar);
        const key = priceEvidenceKey(normalized, category);
        const baseRadar = window.__statgroundBaseRadar || window.__statgroundLastRadar || {};
        window.__statgroundLastRadar = Object.assign({}, baseRadar, {
          products: [],
          deal_candidates: [],
          __sg_price_evidence_loading: key
        });
        rerender();
        fetchPriceRangeEvidence(lang, appEl, normalized, category);
        return;
      }
      rerender();
    }
    function sliderRangeFromInputs() {
      if (!sliderMin || !sliderMax) return currentPriceRange();
      return priceRangeFromSliderIndexes(sliderMin.value, sliderMax.value, sliderBoundaries);
    }
    function setInputsForRange(range) {
      const current = normalizePriceRange(range);
      if (!current) {
        if (minInput) minInput.value = String(sliderBoundaries[0] || 0);
        if (maxInput) maxInput.value = String(sliderBoundaries[sliderBoundaries.length - 1] || "");
        return;
      }
      if (minInput) minInput.value = String(current.min || 0);
      if (maxInput) maxInput.value = current.max !== Infinity ? String(current.max || 0) : "";
    }
    function syncSliderPreview(range, options) {
      const opts = options || {};
      const normalized = normalizePriceRange(range);
      const indexes = priceRangeSliderIndexes(normalized, sliderBoundaries);
      if (sliderMin) sliderMin.value = String(indexes.minIndex);
      if (sliderMax) sliderMax.value = String(indexes.maxIndex);
      if (sliderTrack) {
        sliderTrack.style.left = priceRangeSliderPercent(indexes.minIndex, sliderBoundaries) + "%";
        sliderTrack.style.right = (100 - priceRangeSliderPercent(indexes.maxIndex, sliderBoundaries)) + "%";
      }
      const label = priceRangeLabel(lang, normalized);
      if (sliderLabel) sliderLabel.textContent = label;
      if (status) status.textContent = t(lang, "priceBandSelected") + " · " + label;
      if (!opts.preserveInputs) setInputsForRange(normalized);
    }
    function manualRangeFromInputs() {
      const min = parsePriceRangeInput(minInput && minInput.value, 0);
      const max = parsePriceRangeInput(maxInput && maxInput.value, Infinity);
      if (!Number.isFinite(min) || min < 0 || (max !== Infinity && (!Number.isFinite(max) || max < min))) return undefined;
      const first = Number(sliderBoundaries[0] || 0);
      const last = Number(sliderBoundaries[sliderBoundaries.length - 1] || 0);
      if (min <= first && (max === Infinity || max >= last)) return null;
      return normalizePriceRange({
        key: priceRangeKey(min, max),
        min: min,
        max: max,
        label: priceRangeLabel(lang, { min: min, max: max })
      });
    }
    function previewManualRange() {
      const range = manualRangeFromInputs();
      if (range === undefined) {
        if (status) status.textContent = t(lang, "priceRangeCustomInvalid");
        return;
      }
      syncSliderPreview(range, { preserveInputs: true });
    }
    function commitManualRange() {
      const range = manualRangeFromInputs();
      if (range === undefined) {
        if (status) status.textContent = t(lang, "priceRangeCustomInvalid");
        return;
      }
      setPriceRange(range);
    }
    function sync() {
      syncSliderPreview(currentPriceRange());
    }
    function normalizeSliderHandles(changed) {
      if (!sliderMin || !sliderMax) return;
      let low = clampPriceRangeSliderIndex(sliderMin.value, sliderBoundaries);
      let high = clampPriceRangeSliderIndex(sliderMax.value, sliderBoundaries);
      const last = priceRangeSliderMaxIndex(sliderBoundaries);
      if (high <= low) {
        if (changed === sliderMin) {
          low = Math.max(0, Math.min(last - 1, low));
          high = low + 1;
        } else {
          high = Math.max(1, Math.min(last, high));
          low = high - 1;
        }
      }
      sliderMin.value = String(low);
      sliderMax.value = String(high);
    }
    function bindSliderInput(input) {
      if (!input) return;
      input.addEventListener("input", function () {
        normalizeSliderHandles(input);
        syncSliderPreview(sliderRangeFromInputs());
      });
      input.addEventListener("change", function () {
        normalizeSliderHandles(input);
        setPriceRange(sliderRangeFromInputs());
      });
    }
    bindSliderInput(sliderMin);
    bindSliderInput(sliderMax);
    [minInput, maxInput].forEach((input) => {
      if (!input) return;
      input.addEventListener("input", previewManualRange);
      input.addEventListener("change", commitManualRange);
      input.addEventListener("keydown", function (event) {
        if (event.key !== "Enter") return;
        event.preventDefault();
        commitManualRange();
      });
    });
    const clearButton = appEl.querySelector("[data-price-range-clear]");
    if (clearButton) clearButton.addEventListener("click", function () { setPriceRange(null); });
    sync();
  }

  function setupKeywordTableTabs(appEl) {
    if (!appEl) return;
    const buttons = Array.prototype.slice.call(appEl.querySelectorAll("[data-keyword-tab-button]"));
    const panels = Array.prototype.slice.call(appEl.querySelectorAll("[data-keyword-tab-panel]"));
    if (!buttons.length || !panels.length) return;
    function activate(key) {
      buttons.forEach((button) => {
        const active = button.getAttribute("data-keyword-tab-button") === key;
        button.setAttribute("aria-selected", active ? "true" : "false");
        button.className = keywordTabButtonClass(active);
      });
      panels.forEach((panel) => {
        panel.classList.toggle("hidden", panel.getAttribute("data-keyword-tab-panel") !== key);
      });
    }
    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        activate(button.getAttribute("data-keyword-tab-button") || "");
      });
    });
    const current = buttons.find((button) => button.getAttribute("aria-selected") === "true") || buttons[0];
    activate(current.getAttribute("data-keyword-tab-button") || "");
  }

  function keywordMartSearchParams(query, category) {
    const params = { q: query || "", category: category || "", limit: "24" };
    const range = currentPriceRange();
    if (range) {
      params.min_price = String(range.min || 0);
      if (range.max !== Infinity) params.max_price = String(range.max || 0);
    }
    return params;
  }

  function fetchKeywordMartResult(lang, query, category) {
    return fetchJSONWithRetry(apiURL(lang, "ajax_keyword_search_gmarket", keywordMartSearchParams(query, category)), 2)
      .then((res) => {
        if (!res || !res.ok) throw new Error("keyword_search_failed");
        return keywordSearchPayload(res.json);
      });
  }

  function applyKeywordMartResult(lang, radar, appEl, result, mode) {
    const merged = mergeKeywordSearchResult(radar, result);
    if (!merged || merged === radar) return false;
    const payload = keywordSearchPayload(result);
    window.__statgroundKeywordSearchQuery = keywordSearchPayloadQuery(payload) || window.__statgroundKeywordSearchQuery;
    if (mode === "keyword") {
      renderLoadedKeywordRadar(lang, merged, appEl);
    } else {
      renderLoadedRadar(lang, merged, appEl, {
        baseRadar: window.__statgroundBaseRadar || radar,
        defaultCategory: window.__statgroundSelectedMarketCategory || ""
      });
    }
    return true;
  }

  function setKeywordSearchControlState(appEl, lang, label, disabled) {
    const nextButton = appEl && appEl.querySelector("[data-keyword-search-button]");
    if (!nextButton) return;
    nextButton.disabled = !!disabled;
    nextButton.textContent = label || t(lang, "keywordSearchButton");
  }

  function renderKeywordSearchLoading(lang, radar, appEl, mode, query, selectedCategory) {
    const loadingRadar = Object.assign({}, radar || {}, {
      __sg_keyword_search_query: query,
      __sg_keyword_search_loading: true
    });
    if (mode === "keyword") {
      renderLoadedKeywordRadar(lang, loadingRadar, appEl);
    } else {
      renderLoadedRadar(lang, loadingRadar, appEl, {
        baseRadar: window.__statgroundBaseRadar || radar,
        defaultCategory: selectedCategory || window.__statgroundSelectedMarketCategory || ""
      });
    }
    setKeywordSearchControlState(appEl, lang, t(lang, "keywordSearchLoading"), true);
  }

  function restoreKeywordSearchView(lang, radar, appEl, mode, selectedCategory) {
    if (mode === "keyword") {
      renderLoadedKeywordRadar(lang, radar, appEl);
    } else {
      renderLoadedRadar(lang, radar, appEl, {
        baseRadar: window.__statgroundBaseRadar || radar,
        defaultCategory: selectedCategory || window.__statgroundSelectedMarketCategory || ""
      });
    }
  }

  function setupKeywordMartSearch(lang, radar, appEl, mode) {
    if (!appEl) return;
    const form = appEl.querySelector("[data-keyword-search-form]");
    if (!form || form.getAttribute("data-keyword-search-bound")) return;
    form.setAttribute("data-keyword-search-bound", "1");
    const input = form.querySelector("[data-keyword-filter]");
    const button = form.querySelector("[data-keyword-search-button]");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const query = String(input && input.value || "").trim();
      if (!query) return;
      const selectedCategory = window.__statgroundSelectedMarketCategory || "";
      const category = mode === "category" ? selectedCategory : "";
      const originalLabel = button ? button.textContent : t(lang, "keywordSearchButton");
      if (button) {
        button.disabled = true;
        button.textContent = t(lang, "keywordSearchLoading");
      }
      window.__statgroundKeywordSearchQuery = query;
      renderKeywordSearchLoading(lang, radar, appEl, mode, query, selectedCategory);
      fetchKeywordMartResult(lang, query, category)
        .then((result) => {
          const applied = applyKeywordMartResult(lang, radar, appEl, result, mode);
          if (!applied && button) {
            restoreKeywordSearchView(lang, radar, appEl, mode, selectedCategory);
            setKeywordSearchControlState(appEl, lang, t(lang, "keywordSearchNoResult"), true);
            window.setTimeout(() => {
              setKeywordSearchControlState(appEl, lang, originalLabel || t(lang, "keywordSearchButton"), false);
            }, 900);
          }
        })
        .catch(() => {
          restoreKeywordSearchView(lang, radar, appEl, mode, selectedCategory);
          setKeywordSearchControlState(appEl, lang, t(lang, "keywordSearchNoResult"), true);
          window.setTimeout(() => {
            setKeywordSearchControlState(appEl, lang, originalLabel || t(lang, "keywordSearchButton"), false);
          }, 900);
        });
    });
  }

  function maybeFetchKeywordMartFallback(lang, radar, appEl, selectedKeywords, currentRows) {
    const selected = (selectedKeywords || []).filter(Boolean);
    if (!selected.length || keywordRowsHaveSelectedEvidence(selected, currentRows)) return;
    window.__statgroundKeywordMartFallbackTried = window.__statgroundKeywordMartFallbackTried || {};
    const key = selected.map((keyword) => keywordKey(keyword)).filter(Boolean).join("|");
    if (!key || window.__statgroundKeywordMartFallbackTried[key]) return;
    window.__statgroundKeywordMartFallbackTried[key] = true;
    const query = selected.join(" ");
    window.__statgroundKeywordSearchQuery = query;
    renderKeywordSearchLoading(lang, radar, appEl, "keyword", query, "");
    fetchKeywordMartResult(lang, query, "")
      .then((result) => {
        if (!applyKeywordMartResult(lang, radar, appEl, result, "keyword")) {
          restoreKeywordSearchView(lang, radar, appEl, "keyword", "");
        }
      })
      .catch(() => {
        restoreKeywordSearchView(lang, radar, appEl, "keyword", "");
      });
  }

  function maybeApplyKeywordDeepLinkSearch(lang, radar, appEl) {
    const query = keywordDeepLinkQueryFromURL();
    if (!query || !appEl || analysisModeFromURL() === "keyword") return false;
    if (keywordKey(activeKeywordSearchQuery(radar)) === keywordKey(query)) return false;
    window.__statgroundKeywordDeepLinkTried = window.__statgroundKeywordDeepLinkTried || {};
    const key = keywordKey(query);
    if (!key || window.__statgroundKeywordDeepLinkTried[key]) return false;
    window.__statgroundKeywordDeepLinkTried[key] = true;
    window.__statgroundKeywordSearchQuery = query;
    window.__statgroundSelectedPriceRange = null;
    window.__statgroundSelectedMarketCategory = "";
    renderKeywordSearchLoading(lang, radar, appEl, "category", query, "");
    fetchKeywordMartResult(lang, query, "")
      .then((result) => {
        if (!applyKeywordMartResult(lang, radar, appEl, result, "category")) {
          restoreKeywordSearchView(lang, radar, appEl, "category", "");
        }
      })
      .catch(() => {
        restoreKeywordSearchView(lang, radar, appEl, "category", "");
      });
    return true;
  }

  function keywordRowsHaveSelectedEvidence(selectedKeywords, currentRows) {
    const selectedKeys = uniqueSlugs((selectedKeywords || []).map((keyword) => keywordKey(keyword)).filter(Boolean));
    if (!selectedKeys.length) return true;
    const rows = currentRows || [];
    return selectedKeys.every((key) => rows.some((row) => {
      if (!row || keywordKey(row.keyword) !== key) return false;
      return Number(row.product_count || 0) > 0 || Number(row.category_count || 0) > 0;
    }));
  }

  function setupShoppingFilters(appEl) {
    if (!appEl) return;
    const keywordInput = appEl.querySelector("[data-keyword-filter]");
    const keywordButtons = Array.prototype.slice.call(appEl.querySelectorAll("[data-keyword-filter-mode]"));
    let keywordMode = "all";
    if (keywordInput && window.__statgroundKeywordSearchQuery && !keywordInput.value) {
      keywordInput.value = window.__statgroundKeywordSearchQuery;
    }
    function applyKeywordFilter() {
      const query = String(keywordInput && keywordInput.value || "").trim().toLowerCase();
      Array.prototype.slice.call(appEl.querySelectorAll("[data-keyword-row]")).forEach((row) => {
        const text = String(row.getAttribute("data-filter-text") || "").toLowerCase();
        const cross = row.getAttribute("data-cross-category") === "1";
        const opportunity = Number(row.getAttribute("data-opportunity") || 0);
        const rank = Number(row.getAttribute("data-keyword-rank") || 0);
        const matchedText = !query || text.indexOf(query) >= 0;
        const matchedMode = keywordMode === "cross" ? cross : (keywordMode !== "opportunity" || opportunity >= 60);
        const representative = !!query || keywordMode !== "all" || !rank || rank <= 12;
        row.hidden = !(matchedText && matchedMode && representative);
      });
      keywordButtons.forEach((btn) => {
        const active = (btn.getAttribute("data-keyword-filter-mode") || "all") === keywordMode;
        btn.setAttribute("aria-pressed", active ? "true" : "false");
        btn.className = filterButtonClass(active);
      });
    }
    if (keywordInput) keywordInput.addEventListener("input", applyKeywordFilter);
    keywordButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        keywordMode = btn.getAttribute("data-keyword-filter-mode") || "all";
        applyKeywordFilter();
      });
    });
    applyKeywordFilter();
  }

  function bindKeywordDashboard(lang, radar, appEl) {
    if (!appEl) return;
    appEl.querySelectorAll("[data-top-keyword]").forEach((btn) => {
      if (btn.form && String(btn.form.method || "").toLowerCase() === "post") return;
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        const keyword = btn.getAttribute("data-top-keyword") || "";
        const key = keywordKey(keyword);
        const current = selectedKeywordsFromURL();
        const exists = current.some((item) => keywordKey(item) === key);
        const next = exists ? current.filter((item) => keywordKey(item) !== key) : current.concat([keyword]);
        window.location.href = keywordHref(lang, next);
      });
    });
    appEl.querySelectorAll("[data-clear-keywords]").forEach((btn) => {
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = keywordHref(lang, []);
      });
    });
  }

  function loadComparisonDashboard(lang, radar, appEl, slugs) {
    const selected = uniqueCategorySlugs(slugs).slice(0, 6);
    if (!appEl || selected.length < 2) return;
    appEl.innerHTML = renderComparisonDashboard(lang, radar, [], selected, true);
    bindResearchDashboard(lang, radar, appEl);
    bindPriceBandCriteria(lang, appEl);
    setupShoppingFilters(appEl);
    afterShoppingRender(lang, appEl);
    const requests = selected.map((slug) => fetchJSONWithRetry(apiURL(lang, "ajax_radar_gmarket", { category: slug }), 3)
      .then((res) => res && res.ok && res.json && res.json.radar ? res.json.radar : null)
      .catch(() => null));
    Promise.all(requests).then((radars) => {
      const range = currentPriceRange();
      const baseAnalysisRadar = priceFilteredRadar(radar, range);
      const rows = comparisonRows(baseAnalysisRadar, selected.map((slug, index) => ({ slug: slug, radar: priceFilteredRadar(radars[index], range) })));
      resetProductDetailStore();
      appEl.innerHTML = renderComparisonDashboard(lang, radar, rows, selected, false);
      try {
        paintComparisonCharts(lang, rows);
      } catch (_) {
        markChartsUnavailable(lang, ["sg-shopping-compare-score", "sg-shopping-compare-price", "sg-shopping-compare-share"]);
      }
      bindResearchDashboard(lang, radar, appEl);
      bindPriceBandCriteria(lang, appEl);
      setupShoppingFilters(appEl);
      setupKeywordMartSearch(lang, radar, appEl, "category");
      afterShoppingRender(lang, appEl);
    }).catch(() => {
      appEl.innerHTML = '<div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">' + esc(t(lang, "loadError")) + '</div>';
    });
  }

  function renderLoadedKeywordRadar(lang, radar, appEl) {
    window.__statgroundLastRadar = radar;
    window.__statgroundBaseRadar = window.__statgroundBaseRadar || radar;
    const selectedKeywords = selectedKeywordsFromURL();
    const analysisRadar = priceFilteredRadar(radar, currentPriceRange());
    const rows = keywordStatsRows(analysisRadar, selectedKeywords);
    const categoryRowsForKeyword = keywordCategoryLensRows(analysisRadar, selectedKeywords);
    window.__statgroundSelectedMarketCategory = "";
    appEl.innerHTML = renderKeywordDashboard(lang, radar);
    if (!isKeywordSearchLoading(radar)) {
      try {
        renderInsightCharts(lang, analysisRadar, null);
      } catch (_) {
        markChartsUnavailable(lang, [
          "sg-shopping-chart-price",
          "sg-shopping-chart-category",
          "sg-shopping-chart-candidates",
          "sg-shopping-chart-seller"
        ]);
      }
      try {
        paintKeywordCharts(lang, rows);
        paintKeywordCategoryLensCharts(lang, categoryRowsForKeyword);
      } catch (_) {
        markChartsUnavailable(lang, [
          "sg-shopping-keyword-score",
          "sg-shopping-keyword-price",
          "sg-shopping-keyword-coverage",
          "sg-shopping-keyword-category-score",
          "sg-shopping-keyword-category-price"
        ]);
      }
    }
    bindKeywordDashboard(lang, radar, appEl);
    bindPriceBandCriteria(lang, appEl);
    setupShoppingFilters(appEl);
    setupKeywordMartSearch(lang, radar, appEl, "keyword");
    afterShoppingRender(lang, appEl);
    maybeFetchKeywordMartFallback(lang, radar, appEl, selectedKeywords, rows);
  }

  function renderLoadedRadar(lang, radar, appEl, options) {
    if (!appEl) return;
    const opts = options || {};
    window.__statgroundLastRadar = radar;
    window.__statgroundBaseRadar = opts.baseRadar || window.__statgroundBaseRadar || radar;
    if (opts.defaultCategory) window.__statgroundDefaultMarketCategory = opts.defaultCategory;
    resetProductDetailStore();
    if (analysisModeFromURL() === "keyword") {
      renderLoadedKeywordRadar(lang, radar, appEl);
      return;
    }
    if (!isKeywordSearchLoading(radar) && maybeApplyKeywordDeepLinkSearch(lang, radar, appEl)) return;
    const compareSlugs = compareSlugsFromURL();
    if (compareSlugs.length > 1) {
      window.__statgroundSelectedMarketCategory = "";
      loadComparisonDashboard(lang, radar, appEl, compareSlugs);
      return;
    }
    window.__statgroundSelectedMarketCategory = categoryFromURL(radar) || opts.defaultCategory || window.__statgroundDefaultMarketCategory || "";
    const analysisRadar = priceFilteredRadar(radar, currentPriceRange());
    appEl.innerHTML = renderResearchDashboard(lang, radar, window.__statgroundBaseRadar || radar);
    if (!isKeywordSearchLoading(radar)) {
      try {
        renderInsightCharts(lang, analysisRadar, null);
        paintCategoryKeywordLensCharts(lang, categoryKeywordLensRows(analysisRadar, window.__statgroundSelectedMarketCategory || ""));
      } catch (_) {
        markChartsUnavailable(lang, [
          "sg-shopping-chart-price",
          "sg-shopping-chart-category",
          "sg-shopping-chart-candidates",
          "sg-shopping-chart-seller",
          "sg-shopping-category-keyword-score",
          "sg-shopping-category-keyword-price"
        ]);
      }
    }
    bindResearchDashboard(lang, radar, appEl);
    bindPriceBandCriteria(lang, appEl);
    setupShoppingFilters(appEl);
    setupKeywordMartSearch(lang, radar, appEl, "category");
    afterShoppingRender(lang, appEl);
  }

  function render(langOverride) {
    const root = document.getElementById("div_main");
    if (!root) return;
    const lang = displayLang(langOverride || routeLang());
    const backHref = "/" + encodeURIComponent(lang) + "/workbench/";
    root.innerHTML = [
      '<div class="w-full">',
      '<div class="mx-auto max-w-7xl">',
      '<div class="mb-8">',
      '<a href="' + esc(backHref) + '" class="text-sm font-bold text-slate-500 hover:text-slate-900">← ' + esc(t(lang, "back")) + '</a>',
      '<div class="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">',
      '<div>',
      '<h1 class="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">' + esc(t(lang, "title")) + '</h1>',
      '<p class="mt-3 max-w-3xl text-sm leading-6 text-slate-600">' + esc(t(lang, "desc")) + '</p>',
      '</div>',
      '<span class="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600"><img src="' + esc(providerLogos.gmarket) + '" alt="Gmarket" class="h-5 w-7 rounded object-contain"><img src="' + esc(providerLogos.kurly) + '" alt="Kurly" class="h-5 w-7 rounded object-contain">Derived metrics</span>',
      '</div>',
      '</div>',
      '<div id="sg-shopping-app"><div class="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">' + esc(t(lang, "finding")) + '</div></div>',
      '<div class="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">' + esc(t(lang, "notice")) + '</div>',
      '</div>',
      '</div>'
    ].join("");

    const appEl = document.getElementById("sg-shopping-app");
    function showApp(payload) {
      const radar = payload && payload.radar ? payload.radar : {};
      renderLoadedRadar(lang, radar, appEl);
    }
    function showError() {
      appEl.innerHTML = '<div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">' + esc(t(lang, "loadError")) + '</div>';
    }
    const compareSlugs = compareSlugsFromURL();
    const keywordMode = analysisModeFromURL() === "keyword";
    const radarCategory = keywordMode || compareSlugs.length > 1 ? "" : currentCategorySlug();
    const radarURL = apiURL(lang, "ajax_radar_gmarket", radarCategory ? { category: radarCategory } : {});
    const early = window.__statgroundShoppingRadarEarlyFetch;
    function loadRadar() {
      return fetchJSONWithRetry(radarURL, 3);
    }
    if (early && early.url === radarURL && early.promise) {
      early.promise
        .then((res) => res && res.ok ? res : loadRadar())
        .then((res) => res && res.ok ? showApp(res.json) : showError())
        .catch(function () { loadRadar().then((res) => res && res.ok ? showApp(res.json) : showError()).catch(showError); });
    } else {
      loadRadar().then((res) => res && res.ok ? showApp(res.json) : showError()).catch(showError);
    }
  }

  window.addEventListener("resize", function () {
    Object.keys(chartRegistry).forEach((key) => {
      if (chartRegistry[key]) chartRegistry[key].resize();
    });
  });

  window.addEventListener("popstate", function () {
    render(displayLang(routeLang()));
  });

  window.set_main = render;
  window.addEventListener("sg_lang_changed", function (event) {
    const nextLang = eventLang(event);
    if (nextLang && syncLangToURL(nextLang)) return;
    render(nextLang);
  });
})();
