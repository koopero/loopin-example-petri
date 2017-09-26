#version 150
uniform sampler2D srcSampler;
in vec2 srcCoord;
in vec4 vertColour;

out vec4 outputColour;


void main()
{
  outputColour = vertColour;
}
