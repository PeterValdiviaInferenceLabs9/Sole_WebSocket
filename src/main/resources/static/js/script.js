function cargarPagina(){
	var divContenido = document.createElement("div");
	divContenido.style = "position:fixed; bottom:3rem; right:3rem;" 
	divContenido.innerHTML = '<object type="text/html" data="https://web.inferencelabs9.com/WebSocketSole/widget.html" style="height:420px; width: 320px;"></object>';
	document.body.appendChild(divContenido)
}

cargarPagina();

