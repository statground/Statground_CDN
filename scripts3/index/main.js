/**
 * scripts/main.js
 * - 페이지별 메인 UI만 담당 (header/footer 공통 제외)
 */
const { useState, useEffect } = React;

async function set_main() {
  const main = document.getElementById('div_main');
  if (main) main.innerHTML = '<div id="morph-root" class="w-full flex items-center justify-center"></div>';

const App = () => {
        /**
         * React App 상태(State)
         * - query: 입력창 값
         * - theme: 입력 텍스트에 따라 바뀌는 테마 키(default/gaming/sensitive/shopping)
         *          -> body 클래스(theme-*)로 연결되어 전체 UI 톤이 바뀝니다.
         * - fragments: Enter 입력 시 생성되는 "검색 결과 카드" 목록(데모용 더미 데이터)
         */
        const [query, setQuery] = useState("");
        const [theme, setTheme] = useState("default");
        const [fragments, setFragments] = useState([]);

        /**
         * handleInput()
         * - 사용자가 입력을 바꿀 때마다 query를 갱신
         * - 특정 키워드가 포함되면 theme를 변경해 UI 색감/스타일을 변화시키는 데모 로직
         * - 실제 서비스에서는 "검색어 -> 추천/카테고리 -> UI 변화" 같은 확장 포인트가 될 수 있습니다.
         */
        const handleInput = (e) => {
          const val = e.target.value;
          setQuery(val);

          if (val.includes("게임") || val.includes("game")) setTheme("gaming");
          else if (val.includes("성인") || val.includes("의료") || val.includes("sensitive")) setTheme("sensitive");
          else if (val.includes("쇼핑") || val.includes("커머스")) setTheme("shopping");
          else setTheme("default");
        };

        /**
         * triggerSearch()
         * - Enter 키를 눌렀을 때만 동작하도록 제한
         * - query가 비어 있지 않으면 fragments에 3개의 더미 결과를 채워 카드로 표시
         * - 실제 구현에서는:
         *   (1) API 호출(fetch) 후 결과를 setFragments로 반영
         *   (2) 로딩 상태/에러 상태 UI 추가
         *   (3) 검색어 히스토리/자동완성 등과 연계 가능
         */
        const triggerSearch = (e) => {
          if (e.key === 'Enter' && query.trim() !== "") {
            setFragments([
              { id: 1, title: `[RAW] ${query} 분석 데이터셋`, meta: "CSV / 842.1 MB", desc: "실시간 수집된 원천 데이터를 비식별화하여 제공합니다." },
              { id: 2, title: `[R] ${query} 상관계수 검정 코드`, meta: "WEB-R / SCRIPT", desc: "해당 데이터의 변수 간 유의성을 즉시 검정할 수 있는 자동화 코드입니다." },
              { id: 3, title: `[TALK] ${query} 데이터 토론방`, meta: "실시간 12명", desc: "분석 방법론과 데이터 정합성에 대해 전문가들과 논의하세요." }
            ]);
          }
        };

        /**
         * theme 변경 시 body 클래스 업데이트
         * - Tailwind @layer components 에서 .theme-gaming, .theme-sensitive ... 같은 클래스를 정의
         * - body에 theme-*를 붙이면 전체 배경/글자색, 입력창 스타일 등이 한 번에 바뀝니다.
         * - flex/height 클래스는 레이아웃 기본값이므로 항상 유지합니다.
         */
        useEffect(() => {
          document.body.className = `flex flex-col h-screen ${theme === "default" ? "" : `theme-${theme}`}`;
        }, [theme]);

        return (
          <div className="w-full max-w-7xl">
            <div className="mb-16 text-center md:text-left">
              <p className="text-xs font-black tracking-[0.4em] uppercase opacity-50 mb-6 text-blue-600">Universal Data Discovery</p>

              <div className="flex items-center w-full max-w-3xl mx-auto gap-8">
                <input
                  type="text"
                  className="morph-input w-full"
                  placeholder="무엇을 분석하고 싶으신가요?"
                  data-i18n-placeholder="search.placeholder"
                  value={query}
                  onChange={handleInput}
                  onKeyDown={triggerSearch}
                />
                <div className="flex items-center space-x-2 text-sm font-bold opacity-40 whitespace-nowrap">
                  <span data-i18n="search.press">Press</span>
                  <kbd className="px-2 py-1 bg-slate-200 rounded text-slate-900 border-b-2 border-slate-400"><span data-i18n="search.enter">Enter</span></kbd>
                </div>
              </div>

              <div className="mt-8 pl-6 md:pl-8 flex gap-4 text-sm font-bold opacity-50">
                <span><span data-i18n="search.trending">인기 검색어:</span></span>
                <button onClick={() => setQuery("리그오브레전드")} className="hover:text-blue-600 hover:opacity-100">#LoL</button>
                <button onClick={() => setQuery("새벽배송")} className="hover:text-blue-600 hover:opacity-100">#커머스</button>
                <button onClick={() => setQuery("생존분석")} className="hover:text-blue-600 hover:opacity-100">#의학통계</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fragments.map((f) => (
                <div key={f.id} className="data-fragment show hover:scale-[1.03] cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-1 rounded tracking-tighter">{f.meta}</span>
                    <svg className="w-5 h-5 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7-7 7"></path></svg>
                  </div>
                  <h3 className="text-xl font-black leading-tight mb-3">{f.title}</h3>
                  <p className="text-sm opacity-60 leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      };

      /**
       * React 렌더링 시작점
       * - morph-root는 set_main()에서 div_main 내부에 삽입한 컨테이너입니다.
       * - React 18의 createRoot API를 사용합니다.
       */

const root = ReactDOM.createRoot(document.getElementById('morph-root'));
      root.render(<App />);


// ------------------------------------------------------------
// Ambient particles (배경 파티클)
// ------------------------------------------------------------
const createParticle = () => {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 8 + 4 + 'px';
        p.style.width = size; p.style.height = size;
        p.style.left = Math.random() * 100 + 'vw';
        p.style.top = Math.random() * 100 + 'vh';

        let color = '#3b82f6';
        if (document.body.classList.contains('theme-gaming')) color = '#a855f7';
        else if (document.body.classList.contains('theme-sensitive')) color = '#ef4444';

        p.style.backgroundColor = color;
        p.style.opacity = Math.random() * 0.4;
        document.body.appendChild(p);

        p.animate(
          [{ transform: 'translateY(0)', opacity: 0.3 }, { transform: `translateY(-200px)`, opacity: 0 }],
          { duration: 5000, easing: 'linear' }
        ).onfinish = () => p.remove();
      };
      setInterval(createParticle, 500);
}