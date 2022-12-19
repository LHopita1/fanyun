const bg_shaps = document.querySelectorAll('.shape')
const shape_bound = window.innerHeight * 0.2

function reset() {
	bg_shaps.forEach(e => {
		e.V = [Math.random()+0.1, Math.random()+0.1];
		if(Math.random() > 0.5) e.V[0] *= -1 
		if(Math.random() > 0.5) e.V[1] *= -1 
		e.pos = [Math.random() * (window.innerWidth - shape_bound), Math.random() * (window.innerHeight - shape_bound)]
		e.style.left = e.pos[0] + 'px'
		e.style.top = e.pos[1] + 'px'
	})
}
window.addEventListener('resize', reset)

reset()
const animate = () => {
	bg_shaps.forEach(e => {
		if (e.pos[0] + e.V[0] < 0 || e.pos[0] + e.V[0] > window.innerWidth - shape_bound) { e.V[0] *= -1 }
		if (e.pos[1] + e.V[1] < 0 || e.pos[1] + e.V[1] > window.innerHeight - shape_bound) { e.V[1] *= -1 }
		e.pos[0] += e.V[0]
		e.pos[1] += e.V[1]
		e.style.left = e.pos[0] + 'px'
		e.style.top = e.pos[1] + 'px'
	})
	requestAnimationFrame(() => { animate(); });
}
animate();
