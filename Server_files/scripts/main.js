// import Displaies
var canvas
var ctx
var fontsize=30
var displaies=[]
var format=null

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
requester=new class Requester
{
	socket;
	isfree=true;
	recv_queue={};
	lastID=1
	constructor()
	{
		this.socket=new WebSocket('ws://'+window.location.hostname+':5678');

		this.socket.addEventListener('open', function (event)
		{
		    main().then()
		});
		this.socket.addEventListener('message', function (event)
		{
			var id,data
			[id,data]=split_element(event.data)
			requester.recv_queue[id]=data
		});
		window.addEventListener('unload', function(event)
		{
			requester.Send("close",false)
		});
	}
	async Reserve()
	{
		while(!this.isfree)
			await sleep(10)
		this.isfree=false
	}
	Free()
	{
		this.isfree=true
	}
	Send(data,header=true)
	{
		var headerP
		if(header)
		{
			header=this.lastID.toString()
			headerP=header+"|"
			this.lastID++
		}
		else
			headerP=header=""
		data=headerP+data
		this.socket.send(data);
		return header
	}
	async Recv(header)
	{
		while(!(header in this.recv_queue))
			await sleep(1)
		var data=this.recv_queue[header]
		delete this.recv_queue[header]
		return data
	}
	async Get(data)
	{
		var header=this.Send(data)
		data=await this.Recv(header)
		return data
	}
}
async function setup()
{
	requester.Send("continuous",false)
	canvas = document.getElementById("Canvas");
	ctx = canvas.getContext("2d");
	ctx.font = String(fontsize)+"px Arial";

	var temp=jQuery.getJSON("/JSons"+window.location.pathname+".json")
	while (temp.responseText==undefined)
		await sleep(1)
	format=jQuery.parseJSON(temp.responseText)
}
async function main()
{
	await setup()
	displaies.push(new Displayer_txt_columns("Space","get|space|Resmoc",0,0,450,120,format["Storage"]))
	displaies.push(new Displayer_txt_columns("docker","get|docker",500,0,400,120,format["Containers"]))
	displaies.push(new Displayer_txt_columns("top","get|top",0,150,1200,720,format["Top"]))

	await loop()
}
async function loop()
{
	while(true)
	{
		for(disp in displaies)
		{
			disp=displaies[disp]
			disp.UpdateDataRequest()
		}
		while(!displaies.every(function(disp){return disp.data_ready}))
			await sleep(10)
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for(disp in displaies)
		{
			disp=displaies[disp]
			disp.Draw()
		}
		await sleep(1000)
		// location.reload();
	}
}
