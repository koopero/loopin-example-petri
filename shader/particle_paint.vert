#version 150

uniform mat4 modelViewProjectionMatrix;

in vec4 position;
in vec2 texcoord;
in vec4 color;
in vec4 normal;

uniform sampler2D srcSampler;
uniform int srcWidth;
uniform int srcHeight;
uniform int srcRows;

uniform float clockGlobalTime;
uniform int meshCount;

uniform float sizeMin = 0.0;
uniform float sizeMax = 0.25;

uniform float gain = 1.0;


uniform float passX = 0.0;
uniform float passDensity = 1.0;
uniform int passTotal = 8;
uniform int passIndex = 0;

uniform float blurAmount = 0.01;
uniform float blurZoom = 0.0;
uniform float blurZoomPow = 1.0;





vec4 srcField( int index, int field, float x ) {
  float px = x * float(srcWidth);
  float po = fract( px );
  px -= po;

  float y = float( index * srcRows + field ) / float( srcHeight );

  return mix(
    texture( srcSampler, vec2( px / float(srcWidth), y ) ),
    texture( srcSampler, vec2( (px+1.0) / float(srcWidth), y ) ),
    po
  );
}

out vec2 srcCoord;
out vec4 vertColour;


vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

const float PI = 3.141592654;

void main()
{
  srcCoord = vec2(texcoord.x, texcoord.y);

  int index = int( floor( meshCount * color.b ) );
  // index = 0;

  vec4 FIELD1_0 = srcField( index, 0, 0 );
  float age = FIELD1_0.g;


  float srcX = 0.0 + passX * blurAmount;

  vec4 FIELD0 = srcField( index, 0, srcX );
  vec4 FIELD1 = srcField( index, 1, srcX );
  vec4 FIELD3 = srcField( index, 3, srcX );


  vec2 pos = FIELD0.xy;
  float rotation = FIELD1.x;
  float scale = max( 0.7, FIELD0.b );
  // scale = 0.5;


  vec4 vert = position;


  rotation = fract( clockGlobalTime * ( 0.8 + color.b * 0.2 ) * 0.1 + rotation );

  vert.xyz *= mix( sizeMin, sizeMax, clamp( scale, 0, 1 ) );
  // vert.xyz *= size;
  vert.xy = rotate( vert.xy, rotation * PI * 2 );
  vert.xy += pos * pow( 1+passX, blurZoomPow )*blurZoom;

  // vert.x += index / float( meshCount );
  // vert.y += color.b;


  gl_Position = modelViewProjectionMatrix * vert;
  vertColour = vec4(1,1,1,1);
  vertColour.a = clamp(passDensity,0,1) / pow(scale,2.4) * gain;

  // if ( index > 64 ) {
  //   vertColour.a = 0.0;
  // }

  vertColour.rgb = clamp(FIELD3.rgb * vertColour.a,0,1);
  // vertColour.r = passX;

  // vertColour.a = 1.0/float(passTotal) * 0.01;


}
