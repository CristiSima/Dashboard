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
