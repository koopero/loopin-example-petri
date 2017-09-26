#version 150
in vec2 srcCoord;
out vec4 OUT;

uniform sampler2D srcSampler;
uniform int srcWidth;
uniform int srcHeight;
uniform int srcRows;
uniform int bufferRows;
uniform int bufferWidth;
uniform int bufferHeight;

uniform float clockDelta;
uniform float clockGlobalTime;



uniform float colourDistOffset = 0.0;
uniform float colourDistAmount = 0.03;
uniform float damping = 0.9999;
uniform float gravity = 0.09;

uniform float churn = 0.09;




vec4 srcField( int index, int field, float x ) {
  vec2 coord = vec2( x, float( index * srcRows + field ) / float( srcHeight ) );
  return texture( srcSampler, coord );
}

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


void main()
{

  float delta = clockDelta;
  float bufferX = gl_FragCoord.x / float(bufferWidth);

  float bufferY = gl_FragCoord.y / float(bufferHeight);
  int field = int(bufferY * bufferHeight);
  int index = field / bufferRows;
  int particleCount = bufferHeight / bufferRows;
  field -= index * bufferRows;

  if ( delta <= 0.0  ) {
    OUT = srcField( index, field, bufferX );
    OUT.a = 1.0;
    return;
  }

  if ( bufferX > 1.0/float( bufferWidth )  ) {
    OUT = srcField( index, field, bufferX - 1.0/float( bufferWidth ) );
    OUT.a = 1.0;
    return;
  }

  float x = 0.0;


  OUT = srcField( index, field, x );
  OUT.a = 1.0;

  vec4 FIELD0 = srcField( index, 0, x );
  vec2 pos = FIELD0.xy;
  float scale = FIELD0.b;


  vec4 FIELD1 = srcField( index, 1, x );
  float rotation = FIELD1.r;
  float age = FIELD1.g;
  float spin = FIELD1.b;


  bool shouldSpawn = scale < 0.01 || age > 10;

  float y = float( index ) / float( bufferHeight / bufferRows - 1 );

  if ( shouldSpawn ) {
    if ( field == 0 ) {
      scale = 0.1;
      float a = rand( vec2( clockGlobalTime, y ) ) * 3.1415 * 2;
      float r = 3;
      pos.x = cos( a ) * r;
      pos.y = sin( a ) * r;

      OUT.xy = pos;
      OUT.b = scale;
    } else if ( field == 1 ) {
      float rotation = 0.0;
      float age = 0.0;
      float spin = ( rand( vec2( clockGlobalTime, y ) ) * 2 - 1 ) * 10;
      OUT.r = rotation;
      OUT.g = age;
      OUT.b = spin;

    } else if ( field == 2 ) {
      vec2 vel = vec2(0,0);
      float speed = 0.2 * rand( vec2( clockGlobalTime, y * 100 + 1000 ) ) + 0.2;
      speed *= 0.3;
      OUT.xy = vel;
      OUT.z = speed;
    } else if ( field == 3 ) {
      // vec3 colour = vec3(
      //     rand( vec2( clockGlobalTime, y*100 + 1000 ) ),
      //     rand( vec2( clockGlobalTime+ 1000, y*100 ) ),
      //     rand( vec2( y*100 + 1000, clockGlobalTime ) )
      // );

      vec3 colour = hsv2rgb( vec3(
        rand( vec2( clockGlobalTime, y ) ) * 0.2 + clockGlobalTime * 0.3,
        0.7,
        0.8
      ) );

      OUT.rgb = colour;
    }

  } else {

    if ( field == 0 ) {
      vec4 FIELD2 = srcField( index, 2, x );
      vec2 vel = FIELD2.xy;
      float speed = FIELD2.z;

      pos += vel * delta;
      if ( age < 1 && scale < 1 )
        scale += 0.2*delta;
      else
        scale -= age*0.1 * delta;

      OUT.xy = pos;
      OUT.b = scale;

    } else if ( field == 1 ) {
      vec4 FIELD1 = srcField( index, 1, x );
      float rotation = FIELD1.r;
      float age = FIELD1.g;
      float spin = FIELD1.b;

      vec4 FIELD2 = srcField( index, 2, x );
      vec2 vel = FIELD2.xy;
      float speed = FIELD2.z;


      // rotation = 0;
      rotation += spin * delta;
      rotation = fract( rotation );

      age += speed * delta;

      float spinWeight = 1.0;
      spin *= spinWeight;

      for ( int peerIndex = 0; peerIndex < particleCount; peerIndex ++ ) {
        if ( peerIndex == index )
          continue;


        vec4 peerFIELD0 = srcField( peerIndex, 0, x );
        float peerScale = peerFIELD0.b;
        vec2 peerPos = peerFIELD0.xy;
        float dist = distance( pos.xy, peerPos.xy );

        if ( dist > ( peerScale + scale ) * 1.5 )
          continue;


        vec4 peerFIELD1 = srcField( peerIndex, 1, x );
        float peerSpin = peerFIELD1.b;

        if ( isnan( peerSpin ) )
          continue;

        float sampleWeight = delta;
        spin += peerSpin * sampleWeight;
        spinWeight += sampleWeight;
      }

      spin /= spinWeight;
      // spin *= 0.99;

      OUT.r = rotation;
      OUT.g = age;
      OUT.b = spin;
    } else if ( field == 2 ) {
      vec4 FIELD2 = srcField( index, 2, x );
      vec2 vel = FIELD2.xy;
      float speed = FIELD2.z;

      float dist = length(pos*vec2(0.8,1));


      vel.xy += pos * -delta * gravity * dist * dist;
      // vel.x  -= pos.y * 0.06 * pos.x;
      vel.y  -= (abs(pos.x)-1.5) * churn * gravity * delta * 10.0;

      vec4 FIELD3 = srcField( index, 3, x );
      vec3 colour = FIELD3.rgb;



      for ( int peerIndex = 0; peerIndex < particleCount; peerIndex ++ ) {
        if ( peerIndex == index )
          continue;

        vec4 peerFIELD0 = srcField( peerIndex, 0, x );
        float peerScale = peerFIELD0.b;

        vec4 peerFIELD3 = srcField( peerIndex, 3, x );

        vec2 peerPos = peerFIELD0.xy;

        float dist = distance( pos.xy, peerPos.xy );
        vec2 offset = ( pos.xy - peerPos.xy ) / dist;

        vec3 colourDiff = colour - peerFIELD3.rgb;
        float colourDist = length( colourDiff ) / sqrt(3.0);
        dist *= mix( 1, 0.3, colourDist );

        dist = max( 0.1, dist );

        if ( isnan( dist ) || isnan( offset.x ) || isnan( offset.y ) )
          continue;

        float peerEffect = pow(peerScale / scale, 1.0);

        // if ( dist < 0.3 ) {
        vel += offset * delta * peerEffect / pow( dist, 1.8 ) ;
        // }



        // if ( dist > 0.3 ) {
        // vel += offset  *  * peerEffect / pow( dist, 2.4 );
        // }
      }

      vel *= pow( damping, delta );
      // vel = mix( vel, vec2(0.5, delta );

      OUT.xy = vel;

    }
  }
}
