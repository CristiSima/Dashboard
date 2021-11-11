var canvas
var ctx
var fontsize=30
var displaies=[]
var format=null

var socket = io();

function split_element(request)
{
	return [request.slice(0,end=request.indexOf("|")),request.slice(request.indexOf("|")+1)]
}

function sleep(duration) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, duration)
    })
}

async function setup()
{
	canvas = document.getElementById("Canvas");
	ctx = canvas.getContext("2d");
	ctx.font = String(fontsize)+"px Arial";

	var temp=jQuery.getJSON("/static/JSons/NAME.json")
	while (temp.responseText==undefined)
		await sleep(1)
	format=jQuery.parseJSON(temp.responseText)
}

async function main()
{
	await setup()
	displaies.push(new Displayer_txt_columns("Space","get_space",0,0,450,120,format["Storage"]["refresh rate"],format["Storage"]["layout"]))
	displaies.push(new Displayer_txt_columns("docker","get_docker",500,0,400,120,format["Containers"]["refresh rate"],format["Containers"]["layout"]))
	displaies.push(new Displayer_txt_columns("top","get_top",0,150,1200,720,format["Top"]["refresh rate"],format["Top"]["layout"]))

	start();
}
function start()
{
	for(disp in displaies)
		displaies[disp].MakeRequest()
}
