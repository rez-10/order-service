export async function checkKafkaHealth(kafka) {
  const admin = kafka.admin();
  await admin.connect();
  await admin.disconnect();
  return true;
}
