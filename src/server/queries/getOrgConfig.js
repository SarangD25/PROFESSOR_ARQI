export async function getOrgConfig(args, context) {
  if (!context.user) return null;
  const config = await context.entities.OrgConfig.findUnique({ where: { orgId: args.orgId } });
  // Return saved config or defaults
  return config || {
    weightAssignment: 0.30,
    weightBehavior: 0.10,
    weightPerformance: 0.20,
    weightClassTest: 0.40
  };
}
