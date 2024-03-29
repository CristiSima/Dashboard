var Displaies_id_count=0;
class Displayer_txt
{
	constructor(name,request,x,y,width,height,refresh_rate,alignment="center")
	{
		this.name=name;
		this.request=request;
		this.height=height;
		this.width=width;
		this.x=x;
		this.y=y;
		this.refresh_rate=refresh_rate;
		this.alignment=alignment;
		this.id=Displaies_id_count++;

		socket.on(String(this.id),(data) =>{this.Update(data)});

		this.data_ready=false
	}

	MakeRequest()
	{
		console.log(55,this.request);
		socket.emit(this.request,String(this.id));
	}

	Update(data)
	{
		this.UpdateData(data);
		this.Draw();
		setTimeout(()=>{this.MakeRequest()},this.refresh_rate*1000)
	}
	UpdateData(data)
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
	Draw()
	{
		ctx.fillStyle = "#72BCD4";
		ctx.fillRect(this.x,this.y,this.width,this.height);

		this.DrawTitle()

		this.DrawContent()
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
	UpdateData(data)
	{
		this.data=data.split("\n")
	}
}

class Displayer_txt_columns extends Displayer_txt
{
	constructor(name,request,x,y,width,height,refresh_rate,columns)
	{
		super(name,request,x,y,width,height,refresh_rate)
		this.columns=columns
	}
	UpdateData(data)
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
