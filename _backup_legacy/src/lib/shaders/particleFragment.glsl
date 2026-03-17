uniform vec3 uAccentColor;
uniform float uTime;
uniform float uIntensity;

varying float vLife;
varying float vDistance;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  
  if (dist > 0.5) discard;
  
  // High intensity makes particles "streak" (visually simulated via alpha and glow)
  float alpha = smoothstep(0.5, 0.0, dist);
  
  // Brighten core on intensity
  float glow = 1.0 + uIntensity * 15.0;
  
  // Flicker
  float flicker = mix(1.0, sin(uTime * 20.0 + vDistance) * 0.5 + 0.5, uIntensity);
  
  // Transition color to pure white/blue on high speed
  vec3 color = mix(uAccentColor, vec3(0.8, 0.9, 1.0), uIntensity);
  
  // Shape modulation (simulated motion blur)
  float shape = alpha;
  if(uIntensity > 0.1) {
    shape = smoothstep(0.5, 0.0, dist * (1.0 + uIntensity * 2.0));
  }

  gl_FragColor = vec4(color * glow * flicker, alpha * (1.0 - uIntensity * 0.5));
}
