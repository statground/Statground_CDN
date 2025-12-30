const MENU_ITEMS = [
	{
	  id: "category",
	  label: "카테고리",
	  children: [
		//{ label: "데이터셋", slug: "dataset" },
		{ label: "도서", slug: "book", href: "/data/book/" },
		/*
		{ label: "유튜브", slug: "youtube" },
		{ label: "논문", slug: "paper" },
		{ label: "뉴스", slug: "news" },
		{ label: "사전", slug: "dictionary" },
		{ label: "쇼핑", slug: "shopping" },
		*/
	  ],
	},
	{
	  id: "lab",
	  label: "실험실",
	  children: [
		{ label: "PolyMarket", slug: "polymarket", href: "/lab/polymarket/" },
	  ],
	},
	{ id: "community", label: "커뮤니티", href: "/community/" },
];