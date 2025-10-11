// main 영역 렌더링 함수
function set_main() {
	// 메인 컴포넌트
	function Div_main() {
		return (
		<div className="flex flex-col gap-4 justify-center items-center">
			<h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
			<span className="text-indigo-600">데이터</span>를 수집하고 있습니다.
			</h1>
		</div>
		);
	}

	const root = ReactDOM.createRoot(document.getElementById("div_main"));
	root.render(<Div_main />);
}