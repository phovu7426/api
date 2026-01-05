/**
 * Validate field name để tránh SQL injection
 */
function isValidFieldName(fieldName: string, repository?: any): boolean {
  if (!repository || !fieldName || typeof fieldName !== 'string') {
    return false;
  }
  // Chỉ cho phép các ký tự hợp lệ cho identifier (chữ cái, số, dấu gạch dưới)
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(fieldName)) {
    return false;
  }
  // Kiểm tra field có tồn tại trong entity metadata không
  const validColumns = repository.metadata.columns.map((c: any) => c.propertyName);
  return validColumns.includes(fieldName);
}

export function applyWhereConditions(queryBuilder: any, where: any, repository?: any): void {
  if (Array.isArray(where)) {
    where.forEach((condition, index) => {
      // Validate và filter các keys hợp lệ
      const validKeys = Object.keys(condition).filter((key) =>
        isValidFieldName(key, repository)
      );

      if (validKeys.length === 0) {
        return; // Skip nếu không có key hợp lệ
      }

      const validCondition: any = {};
      const params: any = {};
      validKeys.forEach((key) => {
        validCondition[key] = condition[key];
        params[`${key}_${index}`] = condition[key];
      });

      const conditions = validKeys
        .map((key) => `entity.${key} = :${key}_${index}`)
        .join(' AND ');

      if (index === 0) {
        queryBuilder.andWhere(`(${conditions})`, params);
      } else {
        queryBuilder.orWhere(`(${conditions})`, params);
      }
    });
  } else if (where && typeof where === 'object') {
    // Validate và filter các keys hợp lệ
    const validEntries = Object.entries(where).filter(([key]) =>
      isValidFieldName(key, repository)
    );

    validEntries.forEach(([key, value]) => {
      queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
    });
  }
}

export function applySelectColumns(queryBuilder: any, select?: string[], repository?: any): void {
  if (!Array.isArray(select) || select.length === 0 || !repository) return;

  // Lấy danh sách columns hợp lệ từ entity metadata
  const validColumns = repository.metadata.columns.map((c: any) => c.propertyName);
  const primaryProps = repository.metadata.primaryColumns.map((c: any) => c.propertyName);

  const uniq = new Set<string>();
  // Luôn thêm primary keys
  for (const p of primaryProps) uniq.add(p);

  // Chỉ thêm các columns hợp lệ từ select array
  for (const col of select) {
    if (typeof col === 'string') {
      const trimmed = col.trim();
      // Chỉ thêm nếu column tồn tại trong entity
      if (trimmed && validColumns.includes(trimmed)) {
        uniq.add(trimmed);
      }
      // Nếu không hợp lệ, sẽ bị bỏ qua (không throw error để linh hoạt hơn)
    }
  }

  // Luôn dùng select() vì hàm này được gọi trước applyRelations()
  const columns = Array.from(uniq).map(col => `entity.${col}`);
  queryBuilder.select(columns);
}

/**
 * Apply relations với optimization để tránh N+1 queries
 * Sử dụng leftJoinAndSelect để eager load relations trong 1 query
 */
export function applyRelations(
  queryBuilder: any,
  relations: Array<string | { name: string; select?: string[]; where?: Record<string, any> }>,
  repository?: any
): void {
  if (!Array.isArray(relations) || relations.length === 0) return;

  // Cache để tránh truy vấn metadata lặp lại
  const relationMetadataCache = new Map<string, any>();
  const processedRelations = new Set<string>(); // Track để tránh join trùng

  // Phân loại relations: root level và nested level
  const rootRelations = new Set<string>();
  const nestedRelations = new Map<string, string[]>(); // Map parent -> children

  for (const rel of relations) {
    const relName = typeof rel === 'string' ? rel : rel.name;
    if (!relName) continue;

    // Validate relation name để tránh SQL injection
    if (!/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(relName)) {
      continue; // Skip invalid relation names
    }

    // Tách nested relations (items.product -> items và items.product)
    if (relName.includes('.')) {
      const parts = relName.split('.');
      const rootRel = parts[0];
      const nestedPath = parts.slice(1).join('.');
      
      rootRelations.add(rootRel);
      if (!nestedRelations.has(rootRel)) {
        nestedRelations.set(rootRel, []);
      }
      nestedRelations.get(rootRel)!.push(nestedPath);
    } else {
      rootRelations.add(relName);
    }
  }

  // Xử lý root level relations trước
  // ✅ Sử dụng leftJoinAndSelect để load tất cả relations trong 1 query (giải quyết N+1)
  for (const rel of relations) {
    const relName = typeof rel === 'string' ? rel : rel.name;
    if (!relName || relName.includes('.')) continue; // Skip nested, sẽ xử lý sau
    if (processedRelations.has(relName)) continue;

    if (typeof rel === 'string') {
      // ✅ leftJoinAndSelect: Load relation data trong cùng query (NO N+1)
      queryBuilder.leftJoinAndSelect(`entity.${relName}`, relName);
      processedRelations.add(relName);
    } else if (rel && typeof rel === 'object' && rel.name) {
      const alias = rel.name;

      if (rel.select && Array.isArray(rel.select) && rel.select.length > 0) {
        // ✅ leftJoin với selective fields (vẫn load trong 1 query)
        queryBuilder.leftJoin(`entity.${alias}`, alias);

        // Lấy metadata của relation để đảm bảo primary key luôn được chọn
        let relationMetadata = relationMetadataCache.get(alias);
        if (!relationMetadata && repository) {
          // Tìm relation metadata từ entity metadata
          const relation = repository.metadata.relations.find((r: any) => r.propertyName === alias);
          if (relation) {
            relationMetadata = relation.inverseEntityMetadata;
            relationMetadataCache.set(alias, relationMetadata);
          }
        }

        // Track các fields đã được thêm vào select để tránh duplicate
        const selectedFields = new Set<string>();

        // Luôn thêm primary key của relation để đảm bảo TypeORM map đúng
        if (relationMetadata) {
          const primaryColumns = relationMetadata.primaryColumns.map((pc: any) => pc.propertyName);
          primaryColumns.forEach((pc: string) => {
            if (rel.select && !rel.select.includes(pc)) {
              queryBuilder.addSelect(`${alias}.${pc}`);
              selectedFields.add(pc);
            }
          });
        }

        // Thêm các trường được chỉ định vào select
        for (const field of rel.select) {
          // Validate field name và kiểm tra chưa được thêm
          if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field) && !selectedFields.has(field)) {
            queryBuilder.addSelect(`${alias}.${field}`);
            selectedFields.add(field);
          }
        }
      } else {
        // ✅ leftJoinAndSelect: Load tất cả fields trong 1 query (NO N+1)
        queryBuilder.leftJoinAndSelect(`entity.${alias}`, alias);
      }

      // Nếu có where thì andWhere alias.field = :field cho từng key trong where
      if (rel.where && typeof rel.where === 'object') {
        Object.entries(rel.where).forEach(([key, val]) => {
          // Validate field name để tránh SQL injection
          if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
            return; // Skip invalid field names
          }
          
          // where hỗ trợ giá trị là array (IN)
          if (Array.isArray(val)) {
            queryBuilder.andWhere(`${alias}.${key} IN (:...${alias}_${key})`, { [`${alias}_${key}`]: val });
          } else {
            queryBuilder.andWhere(`${alias}.${key} = :${alias}_${key}`, { [`${alias}_${key}`]: val });
          }
        });
      }

      processedRelations.add(alias);
    }
  }

  // Xử lý nested relations sau khi đã join parent relations
  // ✅ Nested relations cũng được load trong cùng query (NO N+1)
  for (const [parentRel, nestedPaths] of nestedRelations.entries()) {
    // Đảm bảo parent relation đã được join
    if (!processedRelations.has(parentRel)) {
      queryBuilder.leftJoinAndSelect(`entity.${parentRel}`, parentRel);
      processedRelations.add(parentRel);
    }

    // ✅ Join nested relations từ parent alias trong cùng query
    for (const nestedPath of nestedPaths) {
      // Validate nested path
      if (!/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(nestedPath)) {
        continue; // Skip invalid paths
      }
      
      const nestedAlias = nestedPath.replace(/\./g, '_'); // items.product -> items_product
      const fullPath = `${parentRel}.${nestedPath}`;
      
      // ✅ leftJoinAndSelect: Load nested relation trong cùng query
      queryBuilder.leftJoinAndSelect(`${parentRel}.${nestedPath}`, nestedAlias);
    }
  }
}


export function applySorting(queryBuilder: any, sort?: any, repository?: any): void {
  const parseSort = (sortParam?: any): Array<{ field: string; direction: 'ASC' | 'DESC' }> => {
    if (!sortParam) return [];
    const asArray = Array.isArray(sortParam) ? sortParam : [sortParam];
    const map = new Map<string, 'ASC' | 'DESC'>();
    for (const item of asArray) {
      if (!item) continue;
      if (typeof item === 'string') {
        const [fieldRaw, dirRaw] = item.split(':');
        const field = (fieldRaw || '').trim();
        if (!field) continue;
        const direction: 'ASC' | 'DESC' = (dirRaw || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        if (!map.has(field)) map.set(field, direction);
      } else if (typeof item === 'object' && 'field' in item) {
        const f = String((item as any).field || '').trim();
        if (!f) continue;
        const direction: 'ASC' | 'DESC' = ((item as any).direction || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        if (!map.has(f)) map.set(f, direction);
      }
    }
    return Array.from(map.entries()).map(([field, direction]) => ({ field, direction }));
  };
  const parsed = parseSort(sort);
  if (!repository) return;
  const validFields = repository.metadata.columns.map((col: any) => col.propertyName);
  
  // Kiểm tra xem queryBuilder đã có select() rõ ràng chưa
  const hasExplicitSelect = queryBuilder.expressionMap.selects && queryBuilder.expressionMap.selects.length > 0;
  // Kiểm tra xem có joins (relations) không
  // QUAN TRỌNG: Khi có bất kỳ join nào (đặc biệt là leftJoinAndSelect), 
  // TypeORM tự động select TẤT CẢ columns từ entity chính
  // Nếu thêm sort field vào select sẽ gây duplicate column error
  const hasJoins = queryBuilder.expressionMap.joinAttributes && queryBuilder.expressionMap.joinAttributes.length > 0;
  
  // Kiểm tra xem có many-to-many relations không (TypeORM sẽ tự động dùng DISTINCT)
  const hasManyToManyJoins = hasJoins && queryBuilder.expressionMap.joinAttributes.some((join: any) => {
    // TypeORM tự động thêm DISTINCT khi có leftJoinAndSelect với many-to-many
    return join.isManyToMany || (join.relation && join.relation.isManyToMany);
  });
  
  parsed.forEach((s: any, idx: number) => {
    if (!validFields.includes(s.field)) return;
    
    // QUAN TRỌNG: Nếu có bất kỳ join nào, KHÔNG BAO GIỜ thêm sort field vào select
    // vì TypeORM đã tự động select tất cả columns từ entity chính
    // Chỉ thêm sort field nếu:
    // 1. Có explicit select() VÀ không có joins VÀ field chưa có trong select
    if (hasExplicitSelect && !hasJoins) {
      // Kiểm tra kỹ hơn để tránh duplicate column
      // TypeORM có thể tạo alias với nhiều format khác nhau
      const sortFieldInSelect = queryBuilder.expressionMap.selects.some((sel: any) => {
        if (!sel || !sel.selection) return false;
        const selection = String(sel.selection);
        // Kiểm tra nhiều format có thể có:
        // - entity.sort_order
        // - entity.sort_order AS entity_sort_order
        // - entity.sort_order AS "entity_sort_order"
        // - "entity"."sort_order"
        // - entity.sort_order, (có thể có trong một select lớn)
        const fieldPattern = new RegExp(`\\bentity\\.${s.field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
        return (
          selection === `entity.${s.field}` ||
          selection.startsWith(`entity.${s.field} `) ||
          selection.startsWith(`entity.${s.field},`) ||
          selection.includes(`entity.${s.field} AS`) ||
          selection.includes(`"entity"."${s.field}"`) ||
          fieldPattern.test(selection)
        );
      });
      
      // Kiểm tra thêm: xem alias đã tồn tại chưa (tránh duplicate alias)
      const aliasExists = queryBuilder.expressionMap.allAliases && 
        queryBuilder.expressionMap.allAliases.has(`entity_${s.field}`);
      
      if (!sortFieldInSelect && !aliasExists) {
        queryBuilder.addSelect(`entity.${s.field}`);
      }
    }
    // Nếu có joins (đặc biệt là leftJoinAndSelect): KHÔNG thêm sort field vì đã được select tự động
    // Nếu không có explicit select và không có joins: TypeORM sẽ tự động select tất cả columns khi query
    
    // FIX: Khi có many-to-many joins, TypeORM tự động dùng DISTINCT và tạo distinctAlias
    // Cần đảm bảo sort field được thêm vào SELECT trước khi ORDER BY
    // để tránh lỗi "Unknown column 'distinctAlias.entity_created_at'"
    if (hasManyToManyJoins && hasExplicitSelect) {
      // Khi có DISTINCT + explicit select, phải đảm bảo sort field có trong SELECT
      const sortFieldInSelect = queryBuilder.expressionMap.selects.some((sel: any) => {
        if (!sel || !sel.selection) return false;
        const selection = String(sel.selection);
        const fieldPattern = new RegExp(`\\bentity\\.${s.field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
        return fieldPattern.test(selection);
      });
      
      if (!sortFieldInSelect) {
        queryBuilder.addSelect(`entity.${s.field}`);
      }
    }
    
    if (idx === 0) {
      queryBuilder.orderBy(`entity.${s.field}`, s.direction);
    } else {
      queryBuilder.addOrderBy(`entity.${s.field}`, s.direction);
    }
  });
}

export function prepareQuery(query: any = {}): { filters: any; options: any } {
  const filterInput: any = {};
  const optionInput: any = {};
  if (query && typeof query === 'object') {
    if (query.filters && typeof query.filters === 'object') {
      Object.assign(filterInput, query.filters);
    }
    if (query.options && typeof query.options === 'object') {
      Object.assign(optionInput, query.options);
    }
  }
  const rootCompat: any = {};
  if (query.page !== undefined) rootCompat.page = query.page;
  if (query.limit !== undefined) rootCompat.limit = query.limit;
  if (query.sort !== undefined) rootCompat.sort = query.sort;
  // Hỗ trợ sort_by và sort_order (backward compatibility)
  if (query.sort_by && !query.sort) {
    const sortOrder = (query.sort_order || 'DESC').toUpperCase();
    rootCompat.sort = `${query.sort_by}:${sortOrder}`;
  }
  if (query.format !== undefined) rootCompat.format = query.format;
  const options = { ...rootCompat, ...optionInput };
  return { filters: filterInput, options };
}