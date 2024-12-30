type JoinType = "INNER" | "LEFT" | "RIGHT" | "FULL";
type Condition = { field: string; operator: string; value: string | number };
type OrderBy = { field: string; direction: "ASC" | "DESC" };

export interface QueryConfig {
  select: string[];
  from: string;
  joins?: { table: string; on: string; type?: JoinType }[];
  where?: Condition[];
  orderBy?: OrderBy[];
  limit?: number;
}

export const generateQuery = (config: QueryConfig): string => {
  // SELECT clause
  const selectClause = `SELECT ${config.select.join(", ")}`;

  // FROM clause
  const fromClause = `FROM ${config.from}`;

  // JOIN clauses
  const joinClauses =
    config.joins
      ?.map((join) => {
        const joinType = join.type || "INNER";
        return `${joinType} JOIN ${join.table} ON ${join.on}`;
      })
      .join(" ") || "";

  // WHERE clauses
  const whereClauses =
    config.where
      ?.map((condition) => {
        return `${condition.field} ${condition.operator} ${condition.value}`;
      })
      .join(" AND ") || "";

  const whereClause = whereClauses ? `WHERE ${whereClauses}` : "";

  // ORDER BY clause
  const orderByClauses =
    config.orderBy
      ?.map((order) => `${order.field} ${order.direction}`)
      .join(", ") || "";

  const orderByClause = orderByClauses ? `ORDER BY ${orderByClauses}` : "";

  // LIMIT clause
  const limitClause = config.limit !== undefined ? `LIMIT ${config.limit}` : "";

  // Combine all parts
  return [
    selectClause,
    fromClause,
    joinClauses,
    whereClause,
    orderByClause,
    limitClause,
  ]
    .filter((part) => part) // Remove empty parts
    .join(" ");
};
