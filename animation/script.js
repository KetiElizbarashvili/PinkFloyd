var bgCanvas = document.createElement( 'canvas' ),
		bgCtx = bgCanvas.getContext( '2d' ),
		
		s = c.width = c.height = bgCanvas.width = bgCanvas.height = 400,
		ctx = c.getContext( '2d' ),
		
		opts = {
			particles: 250,
			angle: -.4,
			spread: .1,
			start: {
				x: -10,
				y: s / 2 + s / 8
			},
			baseSpeed: 2,
			addedSpeed: 2,
			
			trianglePoints: [
				{
					x: s / 2 + s / 4 * Math.sin( 0 ),
					y: s / 2 - s / 4 * Math.cos( 0 )
				},
				{
					x: s / 2 + s / 4 * Math.sin( Math.PI * 2 / 3 ),
					y: s / 2 - s / 4 * Math.cos( Math.PI * 2 / 3 )
				},
				{
					x: s / 2 + s / 4 * Math.sin( Math.PI * 2 / 3  * 2 ),
					y: s / 2 - s / 4 * Math.cos( Math.PI * 2 / 3  * 2 )
				}
			]
		},
		
		particles = [],
		
		eqns = [
			// equation of triangle lines in the form y = mx + c
			{},{}
		];

eqns[ 0 ].m = ( opts.trianglePoints[ 0 ].y - opts.trianglePoints[ 1 ].y ) / ( opts.trianglePoints[ 0 ].x - opts.trianglePoints[ 1 ].x );
eqns[ 0 ].c = opts.trianglePoints[ 0 ].y - eqns[ 0 ].m * opts.trianglePoints[ 0 ].x;

eqns[ 1 ].m = ( opts.trianglePoints[ 0 ].y - opts.trianglePoints[ 2 ].y ) / ( opts.trianglePoints[ 0 ].x - opts.trianglePoints[ 2 ].x );
eqns[ 1 ].c = opts.trianglePoints[ 0 ].y - eqns[ 1 ].m * opts.trianglePoints[ 0 ].x;

ctx.fillRect( 0, 0, s, s );
bgCtx.fillRect( 0, 0, s, s );
bgCtx.fillStyle = '#111';
bgCtx.strokeStyle = '#555';
bgCtx.beginPath();
bgCtx.moveTo( opts.trianglePoints[ 0 ].x, opts.trianglePoints[ 0 ].y );
bgCtx.lineTo( opts.trianglePoints[ 1 ].x, opts.trianglePoints[ 1 ].y );
bgCtx.lineTo( opts.trianglePoints[ 2 ].x, opts.trianglePoints[ 2 ].y );
bgCtx.closePath();
bgCtx.fill();
bgCtx.stroke();

function Particle(){
	this.reset();
}
Particle.prototype.reset = function(){
	
	var spread = ( Math.random() -.5 ) * 2,
			radian = opts.angle + opts.spread * spread,
			speed = opts.baseSpeed + opts.addedSpeed * Math.random(),
			cos = Math.cos( radian ),
			sin = Math.sin( radian ),
			
			m = sin / cos,
			c = opts.start.y - m * opts.start.x;
	
	this.spread = spread;
	
	this.x = opts.start.x;
	this.y = opts.start.y;
	
	this.vx = cos * speed;
	this.vy = sin * speed;
	
	this.speed = speed;
	
	// ax + b = mx + c -> ax - mx = c - b -> x = ( c - b ) / ( a - m )
	this.interceptX = ( c - eqns[ 1 ].c ) / ( eqns[ 1 ].m - m );
	
	this.state = 'light';
	this.color = 'hsla(hue,80%,light%,.8)'.replace( 'hue', spread * 180 + 180 );
}
Particle.prototype.step = function(){
	
	if( this.state === 'light' ){
		
		ctx.strokeStyle = 'rgba(255,255,255,.8)';
		ctx.beginPath();
		ctx.moveTo( this.x, this.y );
		this.x += this.vx;
		this.y += this.vy;
		ctx.lineTo( this.x, this.y );
		ctx.stroke();
		
		if( this.x >= this.interceptX ){
			
			var c = this.y;
			
			// x = ( c - b ) / ( a - m ), m = 0
			
			this.interceptX = ( c - eqns[ 0 ].c ) / eqns[ 0 ].m;
			this.state = 'rainbow0';
			
			
			this.beginX = this.x;
			this.deltaX = this.interceptX - this.beginX;
		}
		
	} else if( this.state === 'rainbow0' ){
		
		var proportion = 1 - ( this.x - this.beginX ) / this.deltaX;
		
		ctx.strokeStyle = this.color.replace( 'light', proportion * 50 + 50 );
		ctx.beginPath();
		ctx.moveTo( this.x, this.y );
		this.x += this.speed;
		ctx.lineTo( this.x, this.y );
		ctx.stroke();
		
		if( this.x >= this.interceptX ){
			
			var radian = -opts.angle + opts.spread * this.spread * 2;
			
			this.vx = this.speed * Math.cos( radian );
			this.vy = this.speed * Math.sin( radian );
			this.interceptX = s;
			
			this.state = 'rainbow1';
		}
	} else if( this.state === 'rainbow1' ){
		
		ctx.strokeStyle = this.color.replace( 'light', 50 );
		ctx.beginPath();
		ctx.moveTo( this.x, this.y );
		this.x += this.vx;
		this.y += this.vy;
		ctx.lineTo( this.x, this.y );
		ctx.stroke();
		
		if( this.x > this.interceptX ){
			
			this.reset();
		}
	}
}

ctx.drawImage( bgCanvas, 0, 0 );

function anim(){
	
	window.requestAnimationFrame( anim );
	
	ctx.globalAlpha = .08;
	ctx.drawImage( bgCanvas, 0, 0 );
	ctx.globalAlpha = 1;
	
	if( particles.length < opts.particles && Math.random() < .5 )
		particles.push( new Particle );
	
	particles.map( function( particle ){ particle.step(); } );
	
}
anim();
