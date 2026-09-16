const os = require("os");

/**
 * Bu makinenin en olası LAN IPv4 adresini döner (ör. "192.168.1.24").
 * Uygun bir şey bulunamazsa "localhost" döner.
 */
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        candidates.push({ name, address: iface.address });
      }
    }
  }

  if (candidates.length === 0) return "localhost";

  const preferredNamePattern = /wi-?fi|wlan|ethernet|en0|eth0/i;
  const avoidNamePattern = /virtual|vmware|vbox|docker|loopback|hyper-v|tailscale|zerotier/i;

  const preferred = candidates.find(
    (c) => preferredNamePattern.test(c.name) && !avoidNamePattern.test(c.name)
  );
  if (preferred) return preferred.address;

  const notVirtual = candidates.find((c) => !avoidNamePattern.test(c.name));
  if (notVirtual) return notVirtual.address;

  return candidates[0].address;
}

module.exports = { getLocalIp };
