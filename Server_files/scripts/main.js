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
class Displayer_txt
{
	constructor(name,request,x,y,width,height,alignment="center")
	{
		this.name=name
		this.request=request
		this.height=height
		this.width=width
		this.x=x
		this.y=y
		this.alignment=alignment

		this.data_ready=false
	}
	async UpdateDataRequest()
	{
		this.data_ready=false
		var data=await requester.Get(this.request)
		await this.UpdateData(data)
		this.data_ready=true
		// this.Draw()
	}
	async UpdateData(data)
	{
		this.data=data
	}
	DrawTitle()
	{
		ctx.fillStyle = "#000000";
		ctx.textAlign = "center";
		ctx.fillText(this.name,this.x+this.width/2,this.y+25);
	}
	DrawContent()
	{
		// context.textAlign="center|end|left|right|start";
		ctx.textAlign=this.alignment
		if(ctx.textAlign=="left")
			ctx.fillText(this.data,this.x+5				,this.y+fontsize+5+fontsize);
		else
			ctx.fillText(this.data,this.x+5+this.width/2,this.y+fontsize+5+fontsize);
	}
	async Draw()
	{
		ctx.fillStyle = "#72BCD4";
		ctx.fillRect(this.x,this.y,this.width,this.height);

		this.DrawTitle()

		this.DrawContent()
	}
	async Update()
	{
		await this.UpdateData()
		this.Draw()
	}
}

class Displayer_txt_multiline extends Displayer_txt
{
	DrawContent()
	{
		// context.textAlign="center|end|left|right|start";
		ctx.textAlign=this.alignment
		if(ctx.textAlign=="left")
			for(var i in this.data)
				ctx.fillText(this.data[i],this.x+5				,this.y+fontsize+5+fontsize+i*(fontsize+5));
		else
			for(var i in this.data)
				ctx.fillText(this.data[i],this.x+5+this.width/2	,this.y+fontsize+5+fontsize+i*(fontsize+5));
	}
	async UpdateData(data)
	{
		this.data=data.split("\n")
	}
}

class Displayer_txt_columns extends Displayer_txt
{
	constructor(name,request,x,y,width,height,columns)
	{
		super(name,request,x,y,width,height)
		this.columns=columns
	}
	async UpdateData(data)
	{
		var data=data.split("\n")
		this.data=[]
		for(var i in data)
		{
			if(data[i]!="")
				this.data.push(data[i].split("|"))
		}
	}
	Draw()
	{
		ctx.fillStyle = "#72BCD4";
		ctx.fillRect(this.x,this.y,this.width,this.height);

		this.DrawContent()
	}
	DrawTitle(c,x)
	{
		for(var j in this.columns[c][0])
		{
			ctx.textAlign=this.columns[c][0][j][1]
			ctx.fillText(this.columns[c][0][j][0],this.x+this.columns[c][0][j][2],this.y+fontsize+(fontsize+5)*x);
		}
	}
	DrawContent()
	{
		ctx.fillStyle = "#000000";
		var c=0
		var i=0
		var l=0
		if(this.columns[c][2])
		{
			this.DrawTitle(c,l)
			l++
		}
		while(i<this.data.length && c<this.columns.length)
		{
			var columns=this.columns[c]
			for(var j in columns[0])
			{
				ctx.textAlign=columns[0][j][1]
				ctx.fillText(this.data[i][j],this.x+columns[0][j][2],this.y+fontsize+(fontsize+5)*l);
			}

			i++
			l++
			if(i==columns[1])
			{
				c++
				if(c<this.columns.length && this.columns[c][2])
				{
					this.DrawTitle(c,l)
					l++
				}
			}
		}
	}
}
