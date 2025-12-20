// ===== 1) Single Source of Truth =====
const MENU_ITEMS = [
	//{ id: "recommend", label: "추천", href: "/recommend/" },
	{
	  id: "category",
	  label: "카테고리",
	  children: [
		//{ label: "데이터셋", slug: "dataset" },
		{ label: "도서", slug: "book" },
		/*
		{ label: "유튜브", slug: "youtube" },
		{ label: "논문", slug: "paper" },
		{ label: "뉴스", slug: "news" },
		{ label: "사전", slug: "dictionary" },
		{ label: "쇼핑", slug: "shopping" },
		*/
	  ],
	},
	//{ id: "source", label: "데이터 출처", href: "/source/" },
	//{ id: "latest", label: "최신 업데이트", href: "/latest/" },
	{ id: "community", label: "커뮤니티", href: "/community/" },
];