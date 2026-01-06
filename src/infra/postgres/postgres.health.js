export async function checkPostgresHealth(pool) {
  const result = await pool.query("SELECT 1");
  return result.rowCount === 1;
}
