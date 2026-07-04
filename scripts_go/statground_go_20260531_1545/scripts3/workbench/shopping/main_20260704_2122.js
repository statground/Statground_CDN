(function () {
  const ECHARTS_URL = "/_statground/assets/npm/echarts/5.5.1/dist/echarts.min.js";
  const watchKey = "statground_shopping_watchlist_v1";
  const chartRegistry = {};
  let echartsPromise = null;

  function statgroundCDNBase() {
    const assetRoot = "scripts_go/statground_go_20260531_1545/";
    const scriptURL = typeof document !== "undefined" && document.currentScript && document.currentScript.src ? document.currentScript.src : "";
    const rootIndex = scriptURL.indexOf(assetRoot);
    if (rootIndex >= 0) return scriptURL.slice(0, rootIndex);
    return "/";
  }

  const STATGROUND_CDN = statgroundCDNBase();
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
  const KEYWORD_EXCLUSION_TERMS = ["마켓컬리"];

  const dict = {
    ko: {
      back: "워크벤치",
      title: "Shopping Price Insight",
      desc: "Gmarket과 Kurly에서 관측한 카테고리, 키워드, 가격 범위, 기회 신호를 원본 재게시 없이 집계·파생 지표로 분석합니다.",
      notice: "이 화면은 상품 상세를 복제하지 않고 플랫폼별 관측 상품과 카테고리·키워드·가격 범위의 집계 지표를 보여줍니다. 표시 가격과 반응 지표는 수집 시점 관측값이며 실제 구매·판매 판단 전에는 외부몰과 제휴 정책을 확인해야 합니다.",
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
      affiliateDisclosure: "일부 외부 링크에는 제휴 링크가 포함될 수 있습니다. 이 화면은 상품 상세 재게시가 아니라 수집 시점 기준 집계·파생 지표를 제공합니다.",
      candidates: "가격 후보",
      actions: "다음 행동",
      seller: "셀러 기회",
      watchlist: "가격 알림 후보",
      policies: "안전 경계",
      products: "관측 상품",
      categoriesLabel: "카테고리",
      discounted: "할인 신호",
      lowPrice: "1만원 이하",
      latest: "최근 수집",
      median: "중앙값",
      price: "관측가",
      basis: "배송/옵션 미포함",
      originalPrice: "표시 정가",
      categoryMedian: "카테고리 중앙값",
      confidence: "딜 신뢰도",
      reason: "분석 사유",
      collected: "수집 시각",
      source: "판매처에서 현재가 확인",
      saveWatch: "알림 후보 저장",
      savedWatch: "저장됨",
      removeWatch: "삭제",
      routerNotice: "판매처 이동은 서버 링크 라우터를 거치며, 외부몰 이동 또는 파트너 링크가 포함될 수 있습니다.",
      noCandidates: "현재 조건에서 표시할 후보가 없습니다.",
      noSeller: "셀러 기회 신호가 아직 없습니다.",
      noWatchlist: "저장된 가격 알림 후보가 없습니다.",
      pressure_high_price_pressure: "가격 압박 높음",
      pressure_promotion_sensitive: "프로모션 민감",
      pressure_thin_sample: "표본 부족",
      pressure_watch: "관찰",
      status_active: "적용",
      status_partial: "부분 적용",
      chartEmpty: "차트를 그릴 표본이 아직 부족합니다.",
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
      categoryIconOnlyHint: "먼저 아이콘에서 분석할 카테고리 하나를 고르세요. 값과 차트는 선택 후 펼쳐집니다.",
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
      categorySearchPlaceholder: "카테고리 검색",
      keywordSearchPlaceholder: "키워드 검색",
      filterAll: "전체",
      filterOpportunity: "기회 높은 항목",
      filterCrossCategory: "여러 카테고리",
      submitCategory: "카테고리 선택",
      submitKeyword: "키워드 선택",
      priceBandStageTitle: "2. 가격 범위 선택",
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
      priceRangeDragHint: "실제 관측 상품 최저가~최고가 안에서 핸들을 드래그해 조정",
      priceRangeQuick: "빠른 범위",
      priceRangeManual: "숫자로 미세 조정",
      relativeLow: "저가권",
      relativeCenterLow: "하위 중앙권",
      relativeCenterHigh: "상위 중앙권",
      relativePremium: "프리미엄권",
      allView: "전체보기",
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
      analysisPath: "분석 흐름",
      pathMarket: "시장 기준선",
      pathCategory: "카테고리 축",
      pathPrice: "가격 범위",
      pathKeyword: "키워드 축",
      pathSegment: "교차 지점",
      pathEvidence: "상품 근거",
      marketStageTitle: "3. 전체 시장 기준선 보기",
      marketStageDesc: "관측 상품 규모, 할인·저가 신호와 차트로 선택 렌즈를 전체 시장 기준선에 놓고 봅니다.",
      categoryStageTitle: "1. 볼 카테고리 정하기",
      categoryStageDesc: "원본 세부 카테고리는 Statground 표준 10개 축으로 접어 비교합니다. 카테고리는 분석 렌즈일 뿐, 키워드를 독점하지 않습니다.",
      keywordStageTitle: "4. 키워드 축으로 좁히기",
      keywordStageDesc: "키워드는 여러 카테고리에 동시에 걸칠 수 있습니다. 카드에서 키워드를 선택하면 키워드 기준 화면에서 반대쪽 카테고리 분포를 다시 확인할 수 있습니다.",
      keywordPickHint: "키워드 카드를 눌러 선택",
      segmentStageTitle: "5. 카테고리 × 키워드 교차 지점 보기",
      segmentStageDesc: "선택한 축이 만나는 지점에서 가격 분위수, 수요대리, 경쟁강도, 가격공백, 기회점수를 비교합니다.",
      evidenceStageTitle: "6. 근거 상품과 안전 경계 확인",
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
      notice: "This view does not replicate product detail pages. It shows provider-aware observed products plus aggregate metrics by category, keyword, and price range. Prices and reaction signals are observations at collection time; verify the external mall and affiliate policy before buying or selling decisions.",
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
      affiliateDisclosure: "Some outbound links may include affiliate links. This view provides aggregate and derived signals at collection time, not republished product detail content.",
      candidates: "Price candidates",
      actions: "Next actions",
      seller: "Seller opportunities",
      watchlist: "Price alert candidates",
      policies: "Safety boundary",
      products: "Observed products",
      categoriesLabel: "Categories",
      discounted: "Discount signals",
      lowPrice: "Under ₩10,000",
      latest: "Latest collection",
      median: "Median",
      price: "Observed price",
      basis: "Excludes shipping/options",
      originalPrice: "Listed original",
      categoryMedian: "Category median",
      confidence: "Deal confidence",
      reason: "Signal",
      collected: "Collected",
      source: "Check current external price",
      saveWatch: "Save alert candidate",
      savedWatch: "Saved",
      removeWatch: "Remove",
      routerNotice: "Merchant navigation goes through the server link router and may include partner links.",
      noCandidates: "No displayable candidates for the current filters.",
      noSeller: "No seller opportunity signal yet.",
      noWatchlist: "No saved price alert candidates.",
      pressure_high_price_pressure: "High price pressure",
      pressure_promotion_sensitive: "Promotion-sensitive",
      pressure_thin_sample: "Thin sample",
      pressure_watch: "Watch",
      status_active: "Active",
      status_partial: "Partial",
      chartEmpty: "Not enough observations to draw this chart yet.",
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
      categoryIconOnlyHint: "Choose one category icon first. Values and charts open after a category is selected.",
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
      categorySearchPlaceholder: "Search categories",
      keywordSearchPlaceholder: "Search keywords",
      filterAll: "All",
      filterOpportunity: "High opportunity",
      filterCrossCategory: "Cross-category",
      submitCategory: "Select category",
      submitKeyword: "Select keyword",
      priceBandStageTitle: "2. Select price range",
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
      priceRangeDragHint: "Drag within the observed product price range",
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
      analysisPath: "Analysis path",
      pathMarket: "Market baseline",
      pathCategory: "Category axis",
      pathPrice: "Price criteria",
      pathKeyword: "Keyword axis",
      pathSegment: "Cross point",
      pathEvidence: "Product evidence",
      marketStageTitle: "3. Read the market baseline",
      marketStageDesc: "Use observed volume, discount and low-price signals, and charts to place the selected lens against the whole market.",
      categoryStageTitle: "1. Choose a category lens",
      categoryStageDesc: "Raw provider categories are folded into the ten Statground standard axes. A category is a lens, not a strict owner of keywords.",
      keywordStageTitle: "4. Narrow through the keyword axis",
      keywordStageDesc: "A keyword can belong to multiple categories. Select a keyword card to open the keyword view and compare the reverse category distribution.",
      keywordPickHint: "Select a keyword card",
      segmentStageTitle: "5. Read the category × keyword cross point",
      segmentStageDesc: "At the intersection, compare price percentiles, demand proxy, competition, price gap, and opportunity.",
      evidenceStageTitle: "6. Check product evidence and boundaries",
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
    if (seg.length > 0 && seg[0] !== "workbench") return displayLang(seg[0]);
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
    const workbenchIndex = parts.indexOf("workbench");
    if (!langCode || workbenchIndex < 0) return false;
    if (workbenchIndex === 0) parts.unshift(langCode);
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
    const base = "/" + encodeURIComponent(displayLang(lang)) + "/workbench/shopping/" + kind + "/";
    const query = new URLSearchParams(params || {});
    return base + (query.toString() ? "?" + query.toString() : "");
  }

  function shoppingBasePath(lang) {
    return "/" + encodeURIComponent(displayLang(lang)) + "/workbench/shopping/";
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
      const parts = window.location.pathname.split("/").filter(Boolean).map((part) => {
        try { return decodeURIComponent(part); } catch (_) { return part; }
      });
      const workbenchIndex = parts.indexOf("workbench");
      if (workbenchIndex >= 0 && parts[workbenchIndex + 1] === "shopping" && parts[workbenchIndex + 2] === "keyword") {
        return "keyword";
      }
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

  function selectedKeywordsFromURL() {
    try {
      const pathKeywords = [];
      const parts = window.location.pathname.split("/").filter(Boolean).map((part) => {
        try { return decodeURIComponent(part); } catch (_) { return part; }
      });
      const workbenchIndex = parts.indexOf("workbench");
      if (workbenchIndex >= 0 && parts[workbenchIndex + 1] === "shopping" && parts[workbenchIndex + 2] === "keyword" && parts[workbenchIndex + 3]) {
        pathKeywords.push(parts[workbenchIndex + 3]);
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
    return mode === "keyword" ? keywordHref(lang, selectedKeywordsFromURL()) : shoppingBasePath(lang);
  }

  function currentCategorySlug() {
    try {
      const parts = window.location.pathname.split("/").filter(Boolean).map((part) => {
        try { return decodeURIComponent(part); } catch (_) { return part; }
      });
      const workbenchIndex = parts.indexOf("workbench");
      if (workbenchIndex < 0 || parts[workbenchIndex + 1] !== "shopping") return "";
      const type = parts[workbenchIndex + 2] || "";
      if (type === "keyword") return "";
      const slug = type === "category" ? (parts[workbenchIndex + 3] || "") : type;
      if (!slug || slug.indexOf("ajax_") === 0 || slug === "out") return "";
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

  function priceRangeBoundariesForItems(items) {
    const prices = uniqueShoppingItems(items)
      .map((item) => Number(item && item.price_krw || 0))
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

  function priceInRange(price, rawRange) {
    const range = normalizePriceRange(rawRange);
    if (!range) return true;
    const value = Number(price || 0);
    return Number.isFinite(value) && value > 0 && value >= range.min && value <= range.max;
  }

  function filterRowsByPriceRange(rows, rawRange) {
    const range = normalizePriceRange(rawRange);
    if (!range) return (rows || []).slice();
    return (rows || []).filter((row) => priceInRange(rowRepresentativePrice(row), range));
  }

  function filterItemsByPriceRange(items, rawRange) {
    const range = normalizePriceRange(rawRange);
    if (!range) return (items || []).slice();
    return (items || []).filter((item) => priceInRange(item && item.price_krw, range));
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

  function medianValue(values) {
    const rows = (values || []).map((value) => Number(value || 0)).filter((value) => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
    if (!rows.length) return 0;
    const mid = Math.floor(rows.length / 2);
    return rows.length % 2 ? rows[mid] : Math.round((rows[mid - 1] + rows[mid]) / 2);
  }

  function buildPriceRangeSummary(radar, items) {
    const base = radar && radar.summary ? radar.summary : {};
    const rows = uniqueShoppingItems(items);
    const prices = rows.map((item) => Number(item && item.price_krw || 0)).filter((value) => Number.isFinite(value) && value > 0);
    const discountedCount = rows.filter((item) => {
      const price = Number(item && item.price_krw || 0);
      const original = Number(item && item.original_price_krw || 0);
      return Number(item && item.discount_percent || 0) > 0 || (original > 0 && price > 0 && original > price);
    }).length;
    const lowPriceCount = rows.filter((item) => Number(item && item.price_krw || 0) > 0 && Number(item && item.price_krw || 0) <= 10000).length;
    return Object.assign({}, base, {
      product_count: rows.length,
      category_count: uniqueCategorySlugs(rows.map((item) => item && item.source_category)).length,
      min_price_krw: prices.length ? Math.min.apply(null, prices) : 0,
      max_price_krw: prices.length ? Math.max.apply(null, prices) : 0,
      median_price_krw: medianValue(prices),
      discounted_count: discountedCount,
      discounted_percent: ratioPercent(discountedCount, rows.length),
      low_price_count: lowPriceCount,
      low_price_percent: ratioPercent(lowPriceCount, rows.length)
    });
  }

  function priceFilteredRadar(radar, rawRange) {
    const range = normalizePriceRange(rawRange);
    if (!radar || !range) return radar;
    const products = filterItemsByPriceRange((radar && radar.products) || [], range);
    const deals = filterItemsByPriceRange((radar && radar.deal_candidates) || [], range);
    const drops = filterItemsByPriceRange((radar && radar.price_drops) || [], range);
    const uniqueItems = uniqueShoppingItems(products.concat(deals));
    const bands = bucketPrices(uniqueItems);
    const total = bands.reduce((sum, row) => sum + Number(row.count || 0), 0);
    return Object.assign({}, radar, {
      products: products,
      deal_candidates: deals,
      price_drops: drops,
      keywords: filterRowsByPriceRange(((radar && radar.keywords) || []).filter(visibleKeywordRow), range),
      category_keywords: filterRowsByPriceRange(((radar && radar.category_keywords) || []).filter(visibleKeywordRow), range),
      categories: filterRowsByPriceRange((radar && radar.categories) || [], range),
      category_options: filterRowsByPriceRange((radar && radar.category_options) || [], range),
      seller_insights: filterRowsByPriceRange((radar && radar.seller_insights) || [], range),
      price_bands: bands.map((row) => Object.assign({}, row, {
        product_count: Number(row.count || 0),
        product_percent: ratioPercent(row.count, total)
      })),
      summary: buildPriceRangeSummary(radar, uniqueItems)
    });
  }

  function itemMatchesCategory(item, selectedCategory) {
    if (!selectedCategory) return true;
    return normalizedCategorySlug(item && item.source_category) === normalizedCategorySlug(selectedCategory);
  }

  function priceCriteriaItems(radar, selectedCategory, selectedKeywords, mode) {
    let rows = uniqueShoppingItems(((radar && radar.products) || []).concat((radar && radar.deal_candidates) || []));
    if (selectedCategory) rows = rows.filter((item) => itemMatchesCategory(item, selectedCategory));
    if (mode === "keyword" && selectedKeywords && selectedKeywords.length) {
      const keywordRowsForItems = keywordStatsRows(radar, selectedKeywords);
      const keywordItems = uniqueShoppingItems(keywordRowsForItems.reduce((items, row) => items.concat(keywordProducts(radar, row, 0)), []));
      if (keywordItems.length) rows = keywordItems;
    }
    return rows;
  }

  function optionHTML(value, label, selected) {
    return '<option value="' + esc(value) + '"' + (selected ? " selected" : "") + '>' + esc(label) + '</option>';
  }

  function statCard(title, value, sub) {
    return [
      '<div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="text-xs font-bold uppercase tracking-normal text-slate-500">' + esc(title) + '</div>',
      '<div class="mt-2 text-2xl font-black text-slate-950">' + esc(value) + '</div>',
      sub ? '<div class="mt-1 text-xs leading-5 text-slate-500">' + esc(sub) + '</div>' : '',
      '</div>'
    ].join("");
  }

  function chartBox(id, title) {
    return [
      '<section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="mb-3 flex items-center justify-between gap-3">',
      '<h2 class="text-sm font-black text-slate-950">' + esc(title) + '</h2>',
      '</div>',
      '<div id="' + esc(id) + '" class="h-[320px] w-full rounded-lg bg-slate-50"></div>',
      '</section>'
    ].join("");
  }

  function emptyChart(el, lang) {
    if (!el) return;
    el.innerHTML = '<div class="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">' + esc(t(lang, "chartEmpty")) + '</div>';
  }

  function renderSnapshot(lang, radar) {
    const s = radar && radar.summary ? radar.summary : {};
    return [
      '<section class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">',
      statCard(t(lang, "products"), number(s.product_count || 0), t(lang, "latest") + " " + (s.latest_collected_at || "-")),
      statCard(t(lang, "categoriesLabel"), number(s.category_count || 0), t(lang, "median") + " " + krw(s.median_price_krw || 0)),
      statCard(t(lang, "discounted"), number(s.discounted_count || 0), pct(s.discounted_percent || 0)),
      statCard(t(lang, "lowPrice"), number(s.low_price_count || 0), pct(s.low_price_percent || 0)),
      statCard(t(lang, "kpiCoverage"), number(s.history_product_runs || 0), t(lang, "kpiCoverageSub")),
      '</section>',
      '<section class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">',
      statCard(t(lang, "kpiPriceRange"), krw(s.min_price_krw || 0) + " - " + krw(s.max_price_krw || 0), t(lang, "kpiPriceRangeSub")),
      statCard(t(lang, "kpiPolicy"), t(lang, "kpiPolicySub"), t(lang, "routerNotice")),
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
      '<article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="text-xs font-black uppercase text-slate-500">' + esc(title) + '</div>',
      '<div class="mt-2 text-2xl font-black text-slate-950">' + esc(value) + '</div>',
      sub ? '<p class="mt-1 text-xs leading-5 text-slate-500">' + esc(sub) + '</p>' : '',
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
    return [
      '<div class="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">',
      '<div>',
      '<h2 class="text-xl font-black text-slate-950">' + esc(t(lang, titleKey)) + '</h2>',
      '<p class="mt-2 max-w-4xl text-sm leading-6 text-slate-600">' + esc(t(lang, descKey)) + '</p>',
      '</div>',
      meta ? '<span class="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">' + esc(meta) + '</span>' : '',
      '</div>'
    ].join("");
  }

  function renderStage(lang, titleKey, descKey, body, meta) {
    if (!body) return "";
    return [
      '<section class="mb-8">',
      stageHeaderHTML(lang, titleKey, descKey, meta),
      body,
      '</section>'
    ].join("");
  }

  function renderAnalysisPath(lang, mode, selectedCategory, selectedKeywords) {
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
      '<section class="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      '<div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">',
      '<div>',
      '<div class="text-xs font-black uppercase text-slate-500">' + esc(t(lang, "analysisPath")) + '</div>',
      '<div class="mt-1 text-sm font-black text-slate-950">' + esc(t(lang, "selectedLens")) + ' · ' + esc(selectedLabel) + '</div>',
      '</div>',
      '<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">',
      steps.map((step, index) => [
        '<div class="flex min-h-[54px] items-center gap-2 rounded-lg border px-3 py-2 ' + (step.active ? "border-slate-900 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-500") + '">',
        '<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full ' + (step.active ? "bg-white text-slate-950" : "bg-white text-slate-500") + ' text-xs font-black">' + esc(index + 1) + '</span>',
        '<span class="text-xs font-black leading-4">' + esc(t(lang, step.key)) + '</span>',
        '</div>'
      ].join("")).join(""),
      '</div>',
      '</div>',
      '</section>'
    ].join("");
  }

  function renderMarketOverviewStage(lang, radar, selectedCategory) {
    const scoped = selectedCategory ? selectedCategory : t(lang, "allMarket");
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

  function categoryAxisTile(lang, item, active, rank, focused) {
    const name = item && item.source_category ? item.source_category : "-";
    const attrs = 'data-category-card data-filter-text="' + esc([name, number(item && item.product_count || 0), krw(item && item.median_price_krw || 0)].join(" ")) + '" data-opportunity="' + esc(Number(item && item.opportunity_score || 0)) + '"';
    const showValues = focused || active;
    const buttonClass = showValues
      ? 'group flex min-h-[176px] w-full flex-col rounded-lg border p-3 text-left transition '
      : 'group flex min-h-[132px] w-full flex-col items-center justify-center rounded-lg border p-3 text-center transition ';
    const metricsHTML = showValues ? [
      '<div class="mt-2 grid grid-cols-2 gap-2 text-[11px] font-bold ' + (active ? "text-white/80" : "text-slate-500") + '">',
      '<span>' + esc(t(lang, "axisProducts")) + '</span><span class="text-right tabular-nums">' + esc(number(item && item.product_count || 0)) + '</span>',
      '<span>' + esc(t(lang, "axisMedian")) + '</span><span class="text-right tabular-nums">' + esc(krw(item && item.median_price_krw || 0)) + '</span>',
      '</div>',
      '<div class="mt-3 grid gap-2 ' + (active ? "rounded-lg bg-white p-2" : "") + '">',
      compactSignalBar(lang, "metricDemand", item && item.demand_score, "bg-blue-600"),
      compactSignalBar(lang, "metricCompetition", item && item.competition_score, "bg-amber-500"),
      compactSignalBar(lang, "metricOpportunity", item && item.opportunity_score, "bg-emerald-600"),
      '</div>'
    ].join("") : '';
    const button = [
      '<button type="submit" data-market-category="' + esc(name) + '" aria-label="' + esc(t(lang, "submitCategory") + " · " + name) + '" class="' + buttonClass + (active ? "border-slate-950 bg-slate-950 text-white shadow-md" : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50") + '">',
      '<div class="flex items-start justify-between gap-3">',
      '<span class="flex ' + (showValues ? "h-10 w-10" : "h-16 w-16") + ' shrink-0 items-center justify-center rounded-full ' + (active ? "bg-white text-slate-950" : "bg-slate-100 text-slate-700 group-hover:bg-white group-hover:text-blue-700") + '">' + categoryIcon(name) + '</span>',
      showValues ? '<span class="rounded-full ' + (active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600") + ' px-2 py-1 text-[11px] font-black">#' + esc(rank) + '</span>' : '',
      '</div>',
      '<h3 class="mt-3 line-clamp-2 min-h-[2.5rem] text-sm font-black leading-5 ' + (active ? "text-white" : "text-slate-950") + '">' + esc(name) + '</h3>',
      metricsHTML,
      '</button>'
    ].join("");
    return postSelectionForm(lang, "category", name, button, "contents", attrs);
  }

  function renderCategoryAxisStage(lang, radar, selectedCategory, selectedSlugs) {
    const rows = categoryRows(radar);
    if (!rows.length) return "";
    const activeSlugs = uniqueCategorySlugs(selectedSlugs || (selectedCategory ? [selectedCategory] : []));
    const selectedSet = activeSlugs.reduce((acc, slug) => {
      acc[slug] = true;
      return acc;
    }, {});
    const focused = !!selectedCategory || activeSlugs.length > 0;
    const meta = selectedCategory || (activeSlugs.length > 1 ? t(lang, "compareView") + " · " + number(activeSlugs.length) : t(lang, "allView"));
    const body = [
      focused ? '' : '<p class="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">' + esc(t(lang, "categoryIconOnlyHint")) + '</p>',
      '<div class="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">',
      '<label class="block"><span class="sr-only">' + esc(t(lang, "categorySearchPlaceholder")) + '</span><input type="search" data-category-filter class="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="' + esc(t(lang, "categorySearchPlaceholder")) + '"></label>',
      '<div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">',
      '<button type="button" data-category-filter-mode="all" aria-pressed="true" class="rounded-md bg-white px-3 py-2 text-xs font-black text-slate-900 shadow-sm">' + esc(t(lang, "filterAll")) + '</button>',
      '<button type="button" data-category-filter-mode="opportunity" aria-pressed="false" class="rounded-md px-3 py-2 text-xs font-black text-slate-500">' + esc(t(lang, "filterOpportunity")) + '</button>',
      '</div>',
      '</div>',
      '<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">',
      rows.map((item, index) => categoryAxisTile(lang, item, !!selectedSet[normalizedCategorySlug(item && item.source_category)], index + 1, focused)).join(""),
      '</div>',
      selectedCategory ? '<div class="mt-3">' + postSelectionForm(lang, "clear", "", '<button type="submit" class="inline-flex min-h-[36px] items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 hover:border-slate-400">' + esc(t(lang, "clearSelection")) + '</button>') + '</div>' : ''
    ].join("");
    return renderStage(lang, "categoryStageTitle", "categoryStageDesc", body, meta);
  }

  function keywordAxisRows(radar, selectedCategory, selectedKeywords) {
    const selectedKeys = (selectedKeywords || []).map((keyword) => keywordKey(keyword)).filter(Boolean);
    let rows = selectedCategory
      ? scopedCategoryKeywordRows(radar, selectedCategory)
      : baseKeywordRows(radar);
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
      .slice(0, selectedKeys.length ? 8 : 12);
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
      '<label class="block"><span class="sr-only">' + esc(t(lang, "keywordSearchPlaceholder")) + '</span><input type="search" data-keyword-filter class="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="' + esc(t(lang, "keywordSearchPlaceholder")) + '"></label>',
      '<div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">',
      '<button type="button" data-keyword-filter-mode="all" aria-pressed="true" class="rounded-md bg-white px-3 py-2 text-xs font-black text-slate-900 shadow-sm">' + esc(t(lang, "filterAll")) + '</button>',
      '<button type="button" data-keyword-filter-mode="cross" aria-pressed="false" class="rounded-md px-3 py-2 text-xs font-black text-slate-500">' + esc(t(lang, "filterCrossCategory")) + '</button>',
      '<button type="button" data-keyword-filter-mode="opportunity" aria-pressed="false" class="rounded-md px-3 py-2 text-xs font-black text-slate-500">' + esc(t(lang, "filterOpportunity")) + '</button>',
      '</div>',
      '</div>',
      '<p class="mb-3 text-xs font-black uppercase text-slate-500">' + esc(t(lang, "keywordPickHint")) + '</p>',
      '<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">',
      rows.map((row) => {
        const categoryLabels = (row.categories || []).slice(0, 4);
        const categorySummary = categoryLabels.length
          ? categoryLabels.map((name) => '<span class="mr-1 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-600">' + esc(name) + '</span>').join("")
          : '<span class="text-slate-400">-</span>';
        const crossBadge = Number(row.category_count || 0) > 1 ? '<span class="ml-2 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-black text-blue-700">' + esc(t(lang, "crossCategorySignal")) + '</span>' : '';
        const active = !!selectedSet[keywordKey(row.keyword)];
        const attrs = 'data-keyword-row data-filter-text="' + esc([row.keyword, (row.categories || []).join(" "), krw(row.median_price_krw || 0)].join(" ")) + '" data-cross-category="' + (Number(row.category_count || 0) > 1 ? "1" : "0") + '" data-opportunity="' + esc(Number(row.opportunity_score || 0)) + '"';
        const button = [
          '<button type="submit" data-top-keyword="' + esc(row.keyword || "") + '" aria-label="' + esc(t(lang, "submitKeyword") + " · " + (row.keyword || "")) + '" aria-pressed="' + (active ? "true" : "false") + '" class="group flex min-h-[190px] w-full flex-col rounded-lg border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-300 ' + (active ? "border-slate-950 bg-slate-950 text-white shadow-md" : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50") + '">',
          '<div class="flex items-start justify-between gap-3">',
          '<div><div class="text-[11px] font-black uppercase ' + (active ? "text-white/65" : "text-slate-500") + '">' + esc(t(lang, "submitKeyword")) + '</div><h3 class="mt-1 text-base font-black leading-5 ' + (active ? "text-white" : "text-slate-950") + '">#' + esc(row.keyword || "-") + '</h3></div>',
          '<span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ' + (active ? "bg-white text-slate-950" : "bg-slate-100 text-slate-700 group-hover:bg-white group-hover:text-blue-700") + '">#</span>',
          '</div>',
          '<div class="mt-4 grid grid-cols-3 gap-2 text-[11px] font-bold">',
          '<span class="' + (active ? "text-white/70" : "text-slate-500") + '">' + esc(t(lang, "axisProducts")) + '</span><span class="' + (active ? "text-white/70" : "text-slate-500") + '">' + esc(t(lang, "axisMedian")) + '</span><span class="' + (active ? "text-white/70" : "text-slate-500") + '">' + esc(t(lang, "metricOpportunity")) + '</span>',
          '<span class="tabular-nums ' + (active ? "text-white" : "text-slate-950") + '">' + esc(number(row.product_count || 0)) + '</span><span class="tabular-nums ' + (active ? "text-white" : "text-slate-950") + '">' + esc(krw(row.median_price_krw || 0)) + '</span><span>' + scorePill(row.opportunity_score) + '</span>',
          '</div>',
          '<div class="mt-3 flex flex-wrap gap-1.5">' + categorySummary + crossBadge + '</div>',
          '<div class="mt-auto pt-3 text-xs font-black ' + (active ? "text-white/80" : "text-blue-700") + '">' + esc(t(lang, "openKeywordView")) + '</div>',
          '</button>'
        ].join("");
        return postSelectionForm(lang, "keyword", row.keyword, button, "contents", attrs);
      }).join(""),
      '</div>',
      '<div class="mt-3 flex flex-wrap gap-2">',
      postSelectionForm(lang, "keyword", rows[0] && rows[0].keyword, '<button type="submit" class="inline-flex min-h-[36px] items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 hover:border-slate-400">' + esc(t(lang, "openKeywordView")) + '</button>', "contents"),
      selectedCategory ? postSelectionForm(lang, "category", selectedCategory, '<button type="submit" class="inline-flex min-h-[36px] items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 hover:border-slate-400">' + esc(t(lang, "openCategoryView")) + '</button>', "contents") : '',
      '</div>'
    ].join("");
    return renderStage(lang, "keywordStageTitle", "keywordStageDesc", body, meta);
  }

  function renderSegmentStage(lang, radar, selectedCategory, selectedKeywords, mode) {
    let body = "";
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
        renderCrossAnalysis(lang, radar, selectedCategory),
        renderPricePositioning(lang, radar, selectedCategory),
        '</div>'
      ].join("");
    } else {
      body = [
        '<div class="grid grid-cols-1 gap-6">',
        renderCrossAnalysis(lang, radar, ""),
        renderPricePositioning(lang, radar, ""),
        '</div>'
      ].join("");
    }
    return renderStage(lang, "segmentStageTitle", "segmentStageDesc", body, mode === "keyword" ? t(lang, "keywordAxis") : (selectedCategory || t(lang, "allMarket")));
  }

  function renderEvidenceStage(lang, radar, selectedCategory, selectedKeywords, mode) {
    let body = "";
    if (mode === "keyword") {
      const rows = keywordStatsRows(radar, selectedKeywords);
      body = renderKeywordProducts(lang, radar, rows);
    } else if (selectedCategory) {
      body = renderObservedProducts(lang, radar, selectedCategory);
    }
    body = [
      body,
      renderPolicies(lang, radar && radar.policy_notes)
    ].filter(Boolean).join('<div class="mt-6"></div>');
    return renderStage(lang, "evidenceStageTitle", "evidenceStageDesc", body, t(lang, "policies"));
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

  function priceRangeChipHTML(lang, key, title, detail, min, max) {
    const active = activePriceRangeKey() === key;
    return [
      '<button type="button" data-price-band-key="' + esc(key) + '" data-price-band-label="' + esc(title) + '" data-price-min="' + esc(min || 0) + '" data-price-max="' + esc(priceRangeDataMax(max)) + '" aria-label="' + esc(t(lang, "selectPriceBand") + " · " + title) + '" aria-pressed="' + (active ? "true" : "false") + '" class="' + priceRangeChipClass(active) + '">',
      '<span data-price-band-title>' + esc(title) + '</span>',
      detail ? '<span data-price-band-value class="' + (active ? "text-white/75" : "text-slate-500") + '">' + esc(detail) + '</span>' : '',
      '</button>'
    ].join("");
  }

  function priceRangeChipClass(active) {
    return "inline-flex min-h-[38px] items-center gap-2 rounded-full border px-3 text-xs font-black transition focus:outline-none focus:ring-2 focus:ring-blue-300 " + (active ? "border-slate-950 bg-slate-950 text-white shadow-md" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50");
  }

  function renderPriceBandCriteriaStage(lang, radar, selectedCategory, selectedKeywords, mode) {
    const sourceItems = priceCriteriaItems(radar, selectedCategory, selectedKeywords, mode);
    const sourceTotal = sourceItems.length;
    const scope = selectedCategory || ((selectedKeywords || []).length ? selectedKeywords.join(", ") : t(lang, "allMarket"));
    const activeRange = currentPriceRange();
    const priceBoundaries = priceRangeBoundariesForItems(sourceItems);
    const pricePresets = priceRangePresetsFromBoundaries(priceBoundaries);
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
      '<div class="flex justify-between gap-2 text-[11px] font-black text-slate-500">',
      priceBoundaries.map((_, index) => '<span>' + esc(priceRangeBoundaryLabel(index, priceBoundaries)) + '</span>').join(""),
      '</div>',
      '</div>',
      '<div class="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">',
      '<div><div class="mb-2 text-xs font-black uppercase text-slate-500">' + esc(t(lang, "priceRangeQuick")) + '</div><div class="flex flex-wrap gap-2">',
      pricePresets.map((preset) => {
        const label = priceRangeLabel(lang, preset);
        const count = preset.key === "all" ? sourceTotal : filterItemsByPriceRange(sourceItems, preset).length;
        return priceRangeChipHTML(lang, preset.key, label, number(count) + " " + t(lang, "products"), preset.min, preset.max);
      }).join(""),
      '</div></div>',
      '<div class="rounded-lg bg-slate-50 p-3">',
      '<div class="mb-2 flex items-center justify-between gap-2"><span class="text-xs font-black uppercase text-slate-500">' + esc(t(lang, "priceRangeManual")) + '</span><span class="inline-flex max-w-[55%] truncate rounded-full bg-white px-2 py-1 text-[11px] font-black text-slate-600">' + esc(t(lang, "priceBandScope")) + ' · ' + esc(scope) + '</span></div>',
      '<div class="grid grid-cols-2 gap-3">',
      '<label class="block"><span class="text-xs font-black text-slate-500">' + esc(t(lang, "priceRangeMin")) + '</span><input type="number" min="0" step="100" inputmode="numeric" data-price-range-min class="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-black text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="0"></label>',
      '<label class="block"><span class="text-xs font-black text-slate-500">' + esc(t(lang, "priceRangeMax")) + '</span><input type="number" min="0" step="100" inputmode="numeric" data-price-range-max class="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-black text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="' + esc(priceBoundaries[priceBoundaries.length - 1] || 0) + '"></label>',
      '</div>',
      '<div class="mt-3 flex justify-end">',
      '<button type="button" data-price-range-clear class="inline-flex min-h-[36px] items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 hover:border-slate-400">' + esc(t(lang, "priceRangeClear")) + '</button>',
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
      metricCard(t(lang, "categoriesLabel"), number(s.category_count || 0), t(lang, "median") + " " + krw(s.median_price_krw || 0)),
      metricCard(t(lang, "discounted"), pct(s.discounted_percent || 0), number(s.discounted_count || 0) + " " + t(lang, "products")),
      metricCard(t(lang, "lowPrice"), pct(s.low_price_percent || 0), number(s.low_price_count || 0) + " " + t(lang, "products")),
      '</section>',
      '<div class="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">' + esc(t(lang, "affiliateDisclosure")) + '</div>'
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
    return ((radar && radar.keywords) || [])
      .filter(visibleKeywordRow)
      .slice()
      .sort((a, b) => {
        const productDelta = Number(b.product_count || 0) - Number(a.product_count || 0);
        if (productDelta) return productDelta;
        return Number(b.opportunity_score || 0) - Number(a.opportunity_score || 0);
      });
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

  function renderKeywordDiscovery(lang, radar, selectedCategory) {
    const scopedRows = scopedCategoryKeywordRows(radar, selectedCategory);
    let rows = selectedCategory
      ? scopedRows
        .map((item) => ({
          keyword: item.keyword,
          product_count: item.product_count,
          category_count: 1,
          demand_score: item.demand_score,
          competition_score: item.competition_score,
          opportunity_score: item.opportunity_score,
          interpretation: item.interpretation
        }))
      : ((radar && radar.keywords) || []).filter(visibleKeywordRow);
    if (selectedCategory && !rows.length) rows = ((radar && radar.keywords) || []).filter(visibleKeywordRow);
    rows = rows
      .filter(visibleKeywordRow)
      .slice()
      .sort((a, b) => {
        const productDelta = Number(b.product_count || 0) - Number(a.product_count || 0);
        if (productDelta) return productDelta;
        return Number(b.opportunity_score || 0) - Number(a.opportunity_score || 0);
      });
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
    const rows = selectedCategory
      ? scopedCategoryKeywordRows(radar, selectedCategory)
      : scopedCategoryKeywordRows(radar, "");
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
      const rows = scopedCategoryKeywordRows(radar, selectedCategory);
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
      '<div class="grid grid-cols-1 gap-4 xl:grid-cols-2">',
      chartBox("sg-shopping-category-keyword-score", t(lang, "categoryKeywordScoreChart")),
      chartBox("sg-shopping-category-keyword-price", t(lang, "categoryKeywordPriceChart")),
      '</div>',
      '<div class="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">',
      '<table class="min-w-full divide-y divide-slate-200 text-sm">',
      '<thead class="bg-slate-50 text-xs font-black uppercase text-slate-500"><tr><th class="px-4 py-3 text-left">' + esc(t(lang, "query")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "products")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "p50")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "metricDemand")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "metricCompetition")) + '</th><th class="px-4 py-3 text-right">' + esc(t(lang, "metricOpportunity")) + '</th><th class="px-4 py-3 text-left">' + esc(t(lang, "interpretation")) + '</th></tr></thead>',
      '<tbody class="divide-y divide-slate-100 bg-white">',
      rows.map((row) => [
        '<tr>',
        '<td class="px-4 py-3 font-black text-slate-950">#' + esc(row.keyword || "-") + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums">' + esc(number(row.product_count || 0)) + '</td>',
        '<td class="px-4 py-3 text-right tabular-nums font-black text-slate-950">' + esc(krw(row.median_price_krw || 0)) + '</td>',
        '<td class="px-4 py-3 text-right">' + scorePill(row.demand_score) + '</td>',
        '<td class="px-4 py-3 text-right">' + scorePill(row.competition_score) + '</td>',
        '<td class="px-4 py-3 text-right">' + scorePill(row.opportunity_score) + '</td>',
        '<td class="px-4 py-3 text-slate-600">' + esc(row.interpretation || "") + '</td>',
        '</tr>'
      ].join("")).join(""),
      '</tbody></table></div>',
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
      const base = baseByKey[key] || {};
      const scoped = scopedByKey[key] || [];
      const categories = uniqueText(scoped.map((row) => row.source_category));
      const scopedProducts = scoped.reduce((sum, row) => sum + Number(row.product_count || 0), 0);
      const p50 = weightedAverageRows(scoped, "median_price_krw");
      const demand = Number(base.demand_score || 0) || weightedAverageRows(scoped, "demand_score");
      const competition = Number(base.competition_score || 0) || weightedAverageRows(scoped, "competition_score");
      const opportunity = Number(base.opportunity_score || 0) || weightedAverageRows(scoped, "opportunity_score");
      return {
        keyword: display[key] || base.keyword || key,
        keyword_key: key,
        product_count: Number(base.product_count || 0) || scopedProducts,
        category_count: Number(base.category_count || 0) || categories.length,
        p25_price_krw: weightedAverageRows(scoped, "p25_price_krw"),
        median_price_krw: p50,
        p75_price_krw: weightedAverageRows(scoped, "p75_price_krw"),
        iqr_price_krw: weightedAverageRows(scoped, "iqr_price_krw"),
        price_gap_score: Number(base.price_gap_score || 0) || weightedAverageRows(scoped, "price_gap_score"),
        demand_score: demand,
        competition_score: competition,
        opportunity_score: opportunity,
        categories: categories.slice(0, 5),
        interpretation: base.interpretation || ""
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

  function keywordProductColumnCount() {
    const width = Math.max(document.documentElement && document.documentElement.clientWidth || 0, window.innerWidth || 0);
    if (width >= 1536) return 5;
    if (width >= 1280) return 4;
    if (width >= 1024) return 3;
    if (width >= 640) return 2;
    return 1;
  }

  function keywordProductPageSize() {
    return Math.max(2, keywordProductColumnCount() * 2);
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
    return [
      '<section class="grid grid-cols-1 gap-4 xl:grid-cols-2">',
      chartBox("sg-shopping-keyword-score", t(lang, "keywordScoreChart")),
      chartBox("sg-shopping-keyword-price", t(lang, "keywordPriceChart")),
      '<div class="xl:col-span-2">',
      chartBox("sg-shopping-keyword-coverage", t(lang, "keywordCoverageChart")),
      '</div>',
      '</section>'
    ].join("");
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
      '<h2 class="mb-3 text-lg font-black text-slate-950">' + esc(t(lang, "keywordProducts")) + '</h2>',
      '<div class="grid grid-cols-1 gap-5">',
      visible.map((entry) => [
        '<section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" data-keyword-products-section data-keyword-product-page="0">',
        '<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">',
        '<h3 class="text-base font-black text-slate-950">#' + esc(entry.row.keyword || "-") + '</h3>',
        '<span class="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">' + esc(number(entry.products.length)) + ' ' + esc(t(lang, "products")) + '</span>',
        '</div>',
        '<div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" data-keyword-products-grid>',
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

  function keywordCategoryLensRows(radar, selectedKeywords) {
    const selectedRows = keywordStatsRows(radar, selectedKeywords);
    const targetKeys = {};
    selectedRows.slice(0, selectedKeywords && selectedKeywords.length ? 8 : 4).forEach((row) => {
      const key = row && row.keyword_key ? row.keyword_key : keywordKey(row && row.keyword);
      if (key) targetKeys[key] = row.keyword || key;
    });
    return ((radar && radar.category_keywords) || []).filter(visibleKeywordRow)
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
  }

  function renderKeywordCategoryLens(lang, radar, rows) {
    if (!rows.length) return "";
    return [
      '<section>',
      '<div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">',
      '<h2 class="text-lg font-black text-slate-950">' + esc(t(lang, "keywordCategoryLens")) + '</h2>',
      '<span class="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">' + esc(t(lang, "categoryMode")) + '</span>',
      '</div>',
      '<div class="grid grid-cols-1 gap-4 xl:grid-cols-2">',
      chartBox("sg-shopping-keyword-category-score", t(lang, "keywordCategoryScoreChart")),
      chartBox("sg-shopping-keyword-category-price", t(lang, "keywordCategoryPriceChart")),
      '</div>',
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
      renderMarketOverviewStage(lang, analysisRadar, ""),
      renderKeywordAxisStage(lang, analysisRadar, "", selected),
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
    return [
      '<section class="grid grid-cols-1 gap-4 xl:grid-cols-2">',
      chartBox("sg-shopping-compare-score", t(lang, "compareScoreChart")),
      chartBox("sg-shopping-compare-price", t(lang, "comparePriceChart")),
      '<div class="xl:col-span-2">',
      chartBox("sg-shopping-compare-share", t(lang, "compareShareChart")),
      '</div>',
      '</section>'
    ].join("");
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
    return [
      '<section>',
      '<h2 class="mb-3 text-lg font-black text-slate-950">' + esc(t(lang, "compareProducts")) + '</h2>',
      '<div class="grid grid-cols-1 gap-4 xl:grid-cols-2">',
      visible.map((row) => [
        '<section>',
        '<h3 class="text-base font-black text-slate-950">' + esc(row.source_category || "-") + '</h3>',
        '<div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">',
        row.products.map((item) => productCard(lang, item)).join(""),
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

  function renderResearchDashboard(lang, radar) {
    const selected = window.__statgroundSelectedMarketCategory || "";
    const selectedSlugs = selected ? [selected] : [];
    if (!selected) {
      return renderCategoryAxisStage(lang, radar, "", []);
    }
    const analysisRadar = priceFilteredRadar(radar, currentPriceRange());
    return [
      renderCategoryAxisStage(lang, radar, selected, selectedSlugs),
      renderAnalysisModeSwitch(lang, "category"),
      renderAnalysisPath(lang, "category", selected, []),
      renderPriceBandCriteriaStage(lang, radar, selected, [], "category"),
      renderMarketOverviewStage(lang, analysisRadar, selected),
      renderKeywordAxisStage(lang, analysisRadar, selected, []),
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

  function productCard(lang, item) {
    const url = String(item && item.product_url ? item.product_url : "").trim();
    const code = item && item.product_code ? String(item.product_code) : "";
    const key = itemKey(item);
    const isWatched = watched(item);
    const label = productLabel(item);
    const img = imageURL(item);
    return [
      '<article class="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">',
      img ? '<div class="mb-3 flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50"><img src="' + esc(img) + '" alt="' + esc(label) + '" loading="lazy" referrerpolicy="no-referrer" class="max-h-full max-w-full object-contain"></div>' : '',
      '<div class="flex items-start justify-between gap-3">',
      '<div>',
      '<div class="mb-2">' + providerBadge(item, false) + '</div>',
      '<h3 class="text-sm font-black leading-5 text-slate-950">' + esc(label) + '</h3>',
      '<div class="mt-1 flex flex-wrap gap-1 text-[11px] font-bold text-slate-500">',
      '<span class="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">' + esc(item && item.source_category ? item.source_category : "") + '</span>',
      code ? '<span class="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">' + esc(code) + '</span>' : '',
      '</div>',
      '</div>',
      '<span class="rounded-full bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">' + esc(number(item && (item.deal_confidence_score || item.radar_score) || 0)) + '</span>',
      '</div>',
      '<dl class="mt-4 grid gap-2 text-xs text-slate-600">',
      '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "price")) + '</dt><dd class="font-black text-slate-950">' + esc(krw(item && item.price_krw)) + '</dd></div>',
      '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "basis")) + '</dt><dd class="text-right">' + esc(t(lang, "basis")) + '</dd></div>',
      item && item.original_price_krw ? '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "originalPrice")) + '</dt><dd>' + esc(krw(item.original_price_krw)) + '</dd></div>' : '',
      item && item.category_median_price_krw ? '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "categoryMedian")) + '</dt><dd>' + esc(krw(item.category_median_price_krw)) + '</dd></div>' : '',
      item && item.reason ? '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "reason")) + '</dt><dd class="text-right">' + esc(item.reason) + '</dd></div>' : '',
      item && item.collected_at ? '<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">' + esc(t(lang, "collected")) + '</dt><dd class="text-right">' + esc(item.collected_at) + '</dd></div>' : '',
      '</dl>',
      '<div class="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">' + esc(t(lang, "routerNotice")) + '</div>',
      '<div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">',
      key ? '<button type="button" data-watch-code="' + esc(key) + '" class="min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-slate-700 hover:border-slate-500">' + esc(isWatched ? t(lang, "savedWatch") : t(lang, "saveWatch")) + '</button>' : '',
      url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" class="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-slate-700">' + esc(t(lang, "source")) + '</a>' : '',
      '</div>',
      '</article>'
    ].join("");
  }

  function renderCandidates(lang, items) {
    if (!items || !items.length) {
      return '<section class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">' + esc(t(lang, "noCandidates")) + '</section>';
    }
    return '<section><h2 class="mb-3 text-lg font-black text-slate-950">' + esc(t(lang, "candidates")) + '</h2><div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">' + items.map((item) => productCard(lang, item)).join("") + '</div></section>';
  }

  function renderObservedProducts(lang, radar, selectedCategory) {
    if (!selectedCategory) return "";
    const items = ((radar && radar.products) || []).length ? radar.products : ((radar && radar.deal_candidates) || []);
    if (!items.length) {
      return '<section class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">' + esc(t(lang, "categoryEmpty")) + '</section>';
    }
    return '<section><h2 class="mb-3 text-lg font-black text-slate-950">' + esc(selectedCategory + " · " + t(lang, "categoryObservedProducts")) + '</h2><div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">' + items.map((item) => productCard(lang, item)).join("") + '</div></section>';
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
        '<div class="flex items-center gap-3">',
        imageURL(item) ? '<div class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-white"><img src="' + esc(imageURL(item)) + '" alt="' + esc(productLabel(item)) + '" loading="lazy" referrerpolicy="no-referrer" class="max-h-full max-w-full object-contain"></div>' : '',
        '<div><div class="mb-1">' + providerBadge(item, true) + '</div><div class="font-black text-slate-900">' + esc(productLabel(item)) + '</div><div class="mt-1 text-slate-500">' + esc(item.source_category || "") + ' · ' + esc(krw(item.price_krw || 0)) + '</div></div>',
        '</div>',
        '<div class="flex gap-2">',
        item.product_url ? '<a class="inline-flex min-h-[34px] items-center rounded-lg bg-slate-900 px-3 font-black text-white" href="' + esc(item.product_url) + '" target="_blank" rel="noopener noreferrer">' + esc(t(lang, "source")) + '</a>' : '',
        '<button type="button" data-remove-watch="' + esc(itemKey(item)) + '" class="min-h-[34px] rounded-lg border border-slate-300 px-3 font-black text-slate-600">' + esc(t(lang, "removeWatch")) + '</button>',
        '</div>',
        '</div>'
      ].join("")).join(""),
      '</div>',
      '</section>'
    ].join("");
  }

  function renderChartsShell(lang, selectedCategory) {
    const scoped = Boolean(selectedCategory);
    return [
      '<section class="grid grid-cols-1 gap-4 xl:grid-cols-2">',
      chartBox("sg-shopping-chart-price", t(lang, "chartPrice")),
      chartBox("sg-shopping-chart-category", scoped ? t(lang, "chartKeywordCategory") : t(lang, "chartCategory")),
      chartBox("sg-shopping-chart-candidates", scoped ? t(lang, "chartKeywordCandidates") : t(lang, "chartCandidates")),
      chartBox("sg-shopping-chart-seller", scoped ? t(lang, "chartKeywordSeller") : t(lang, "chartSeller")),
      '</section>'
    ].join("");
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
    if (candidates && candidates.length) return bucketPrices(candidates);
    const bands = radar && Array.isArray(radar.price_bands) ? radar.price_bands.filter((row) => row && row.label) : [];
    if (bands.length) {
      return bands.map((row) => ({
        label: row.label,
        count: Number(row.product_count || 0)
      }));
    }
    return bucketPrices(candidates);
  }

  function majorKeywordRows(radar, selectedCategory) {
    if (!selectedCategory) return [];
    return scopedCategoryKeywordRows(radar, selectedCategory)
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

  function paintChart(id, lang, option) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!option) {
      emptyChart(el, lang);
      return;
    }
    loadECharts().then((echarts) => {
      if (!document.body.contains(el)) return;
      if (chartRegistry[id]) chartRegistry[id].dispose();
      chartRegistry[id] = echarts.init(el, null, { renderer: "canvas" });
      chartRegistry[id].setOption(option);
    }).catch(() => emptyChart(el, lang));
  }

  function chartTextStyle() {
    return { color: "#334155", fontFamily: "Inter, system-ui, sans-serif" };
  }

  function renderInsightCharts(lang, radar, finder) {
    const selected = window.__statgroundSelectedMarketCategory || "";
    const crossPoints = scopedCategoryKeywordRows(radar, selected)
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

  function bindWatchButtons(lang, currentItems) {
    const map = {};
    (currentItems || []).forEach((item) => {
      const key = itemKey(item);
      if (key) map[key] = item;
    });
    document.querySelectorAll("[data-watch-code]").forEach((btn) => {
      btn.addEventListener("click", function () {
        const code = btn.getAttribute("data-watch-code");
        saveWatch(map[code]);
        const result = document.getElementById("sg-shopping-category-result") || document.getElementById("sg-shopping-finder-result");
        if (result && window.__statgroundLastFinder) {
          result.innerHTML = renderCategoryResult(lang, window.__statgroundLastFinder, window.__statgroundSelectedCategory || "");
          bindWatchButtons(lang, window.__statgroundLastFinder.candidates || []);
        }
      });
    });
    document.querySelectorAll("[data-remove-watch]").forEach((btn) => {
      btn.addEventListener("click", function () {
        removeWatch(btn.getAttribute("data-remove-watch"));
        const result = document.getElementById("sg-shopping-category-result") || document.getElementById("sg-shopping-finder-result");
        if (result && window.__statgroundLastFinder) {
          result.innerHTML = renderCategoryResult(lang, window.__statgroundLastFinder, window.__statgroundSelectedCategory || "");
          bindWatchButtons(lang, window.__statgroundLastFinder.candidates || []);
        }
      });
    });
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
          bindWatchButtons(lang, window.__statgroundLastFinder.candidates || []);
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
          bindWatchButtons(lang, window.__statgroundLastFinder.candidates || []);
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
        appEl.innerHTML = renderResearchDashboard(lang, radar);
        renderInsightCharts(lang, analysisRadar, null);
        paintCategoryKeywordLensCharts(lang, categoryKeywordLensRows(analysisRadar, window.__statgroundSelectedMarketCategory || ""));
        bindResearchDashboard(lang, radar, appEl);
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
  }

  function filterButtonClass(active) {
    return "rounded-md px-3 py-2 text-xs font-black " + (active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500");
  }

  function bindPriceBandCriteria(lang, appEl) {
    if (!appEl) return;
    const buttons = Array.prototype.slice.call(appEl.querySelectorAll("[data-price-band-key]"));
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
      if (radar) renderLoadedRadar(lang, radar, appEl);
    }
    function setPriceRange(raw) {
      const normalized = normalizePriceRange(raw);
      window.__statgroundSelectedPriceRange = normalized;
      window.__statgroundSelectedPriceBandKey = normalized ? normalized.key : "all";
      window.__statgroundSelectedPriceBandLabel = priceRangeLabel(lang, normalized);
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
      const activeKey = activePriceRangeKey();
      buttons.forEach((btn) => {
        const active = btn.getAttribute("data-price-band-key") === activeKey;
        btn.setAttribute("aria-pressed", active ? "true" : "false");
        btn.className = priceRangeChipClass(active);
        const title = btn.querySelector("[data-price-band-title]");
        const value = btn.querySelector("[data-price-band-value]");
        if (title) title.className = "";
        if (value) value.className = active ? "text-white/75" : "text-slate-500";
      });
      syncSliderPreview(currentPriceRange());
    }
    buttons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const key = btn.getAttribute("data-price-band-key") || "all";
        const min = parsePriceRangeInput(btn.getAttribute("data-price-min"), 0);
        const maxRaw = btn.getAttribute("data-price-max") || "inf";
        const max = maxRaw === "inf" ? Infinity : parsePriceRangeInput(maxRaw, Infinity);
        setPriceRange(key === "all" ? null : {
          key: key,
          min: min,
          max: max,
          label: btn.getAttribute("data-price-band-label") || ""
        });
      });
    });
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

  function setupShoppingFilters(appEl) {
    if (!appEl) return;
    const categoryInput = appEl.querySelector("[data-category-filter]");
    const categoryButtons = Array.prototype.slice.call(appEl.querySelectorAll("[data-category-filter-mode]"));
    let categoryMode = "all";
    function applyCategoryFilter() {
      const query = String(categoryInput && categoryInput.value || "").trim().toLowerCase();
      Array.prototype.slice.call(appEl.querySelectorAll("[data-category-card]")).forEach((card) => {
        const text = String(card.getAttribute("data-filter-text") || "").toLowerCase();
        const opportunity = Number(card.getAttribute("data-opportunity") || 0);
        const matchedText = !query || text.indexOf(query) >= 0;
        const matchedMode = categoryMode !== "opportunity" || opportunity >= 60;
        card.hidden = !(matchedText && matchedMode);
      });
      categoryButtons.forEach((btn) => {
        const active = (btn.getAttribute("data-category-filter-mode") || "all") === categoryMode;
        btn.setAttribute("aria-pressed", active ? "true" : "false");
        btn.className = filterButtonClass(active);
      });
    }
    if (categoryInput) categoryInput.addEventListener("input", applyCategoryFilter);
    categoryButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        categoryMode = btn.getAttribute("data-category-filter-mode") || "all";
        applyCategoryFilter();
      });
    });
    applyCategoryFilter();

    const keywordInput = appEl.querySelector("[data-keyword-filter]");
    const keywordButtons = Array.prototype.slice.call(appEl.querySelectorAll("[data-keyword-filter-mode]"));
    let keywordMode = "all";
    function applyKeywordFilter() {
      const query = String(keywordInput && keywordInput.value || "").trim().toLowerCase();
      Array.prototype.slice.call(appEl.querySelectorAll("[data-keyword-row]")).forEach((row) => {
        const text = String(row.getAttribute("data-filter-text") || "").toLowerCase();
        const cross = row.getAttribute("data-cross-category") === "1";
        const opportunity = Number(row.getAttribute("data-opportunity") || 0);
        const matchedText = !query || text.indexOf(query) >= 0;
        const matchedMode = keywordMode === "cross" ? cross : (keywordMode !== "opportunity" || opportunity >= 60);
        row.hidden = !(matchedText && matchedMode);
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
    const requests = selected.map((slug) => fetchJSONWithRetry(apiURL(lang, "ajax_radar_gmarket", { category: slug }), 3)
      .then((res) => res && res.ok && res.json && res.json.radar ? res.json.radar : null)
      .catch(() => null));
    Promise.all(requests).then((radars) => {
      const range = currentPriceRange();
      const baseAnalysisRadar = priceFilteredRadar(radar, range);
      const rows = comparisonRows(baseAnalysisRadar, selected.map((slug, index) => ({ slug: slug, radar: priceFilteredRadar(radars[index], range) })));
      appEl.innerHTML = renderComparisonDashboard(lang, radar, rows, selected, false);
      paintComparisonCharts(lang, rows);
      bindResearchDashboard(lang, radar, appEl);
      bindPriceBandCriteria(lang, appEl);
      setupShoppingFilters(appEl);
      bindWatchButtons(lang, rows.reduce((items, row) => items.concat(row.products || []), []));
    }).catch(() => {
      appEl.innerHTML = '<div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">' + esc(t(lang, "loadError")) + '</div>';
    });
  }

  function renderLoadedKeywordRadar(lang, radar, appEl) {
    const selectedKeywords = selectedKeywordsFromURL();
    const analysisRadar = priceFilteredRadar(radar, currentPriceRange());
    const rows = keywordStatsRows(analysisRadar, selectedKeywords);
    const categoryRowsForKeyword = keywordCategoryLensRows(analysisRadar, selectedKeywords);
    window.__statgroundSelectedMarketCategory = "";
    appEl.innerHTML = renderKeywordDashboard(lang, radar);
    paintKeywordCharts(lang, rows);
    paintKeywordCategoryLensCharts(lang, categoryRowsForKeyword);
    bindKeywordDashboard(lang, radar, appEl);
    bindPriceBandCriteria(lang, appEl);
    setupShoppingFilters(appEl);
    setupKeywordProductPagination(appEl);
    bindWatchButtons(lang, rows.reduce((items, row) => items.concat(keywordProducts(analysisRadar, row, selectedKeywords.length ? 60 : 24)), []));
  }

  function renderLoadedRadar(lang, radar, appEl) {
    if (!appEl) return;
    window.__statgroundLastRadar = radar;
    if (analysisModeFromURL() === "keyword") {
      renderLoadedKeywordRadar(lang, radar, appEl);
      return;
    }
    const compareSlugs = compareSlugsFromURL();
    if (compareSlugs.length > 1) {
      window.__statgroundSelectedMarketCategory = "";
      loadComparisonDashboard(lang, radar, appEl, compareSlugs);
      return;
    }
    window.__statgroundSelectedMarketCategory = categoryFromURL(radar);
    const analysisRadar = priceFilteredRadar(radar, currentPriceRange());
    appEl.innerHTML = renderResearchDashboard(lang, radar);
    renderInsightCharts(lang, analysisRadar, null);
    paintCategoryKeywordLensCharts(lang, categoryKeywordLensRows(analysisRadar, window.__statgroundSelectedMarketCategory || ""));
    bindResearchDashboard(lang, radar, appEl);
    bindPriceBandCriteria(lang, appEl);
    setupShoppingFilters(appEl);
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
      '<div class="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">' + esc(t(lang, "notice")) + '</div>',
      '<div id="sg-shopping-app"><div class="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">' + esc(t(lang, "finding")) + '</div></div>',
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
