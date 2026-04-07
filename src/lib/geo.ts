// Helper for reverse geocoding (Nominatim)
export async function getHumanAddress(lat: number, lon: number) {
    if (!lat || !lon) return 'Missing GPS Signal';
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
          headers: { 'User-Agent': 'Field-Officer-App-v1.0' }
      });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      const addr = data.address;
      if (!addr) return 'Unknown Sector';
      
      // Prioritizing District/County for administrative clarity
      const parts = [
          addr.road || addr.suburb || addr.neighbourhood,
          addr.village || addr.town || addr.city,
          addr.district || addr.county || addr.state_district || addr.city_district || addr.state
      ].filter(Boolean);
      
      return parts.join(', ') || 'Remote Field Area';
    } catch (e) {
      return 'Sector Data Unavailable';
    }
}
