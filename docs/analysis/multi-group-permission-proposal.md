TOÀN BỘ LUỒNG + DANH SÁCH BẢNG + CÁC ĐIỂM CẦN CHÚ Ý theo đúng những gì bạn đã chốt, để bạn gửi thẳng cho đội BE triển khai.

CHỐT KIẾN TRÚC

Context = cha (chỉ để tổ chức)

Group = scope thực thi quyền

User bắt buộc thuộc ≥ 1 group (kể cả admin)

Role gắn với group, không dùng scope_type

I. CÁC BẢNG & TRƯỜNG (FINAL)

2. contexts (CHA – chỉ tổ chức)
contexts (
  id
  name
  code
  status
  created_at
)

3. groups (SCOPE QUYỀN)
groups (
  id
  context_id      -- FK -> contexts.id (NOT NULL)
  name
  code
  status
  created_at
)


📌 1 context → nhiều group

4. user_groups (BẮT BUỘC)
user_groups (
  user_id         -- FK -> users.id
  group_id        -- FK -> groups.id
  joined_at

  PRIMARY KEY (user_id, group_id)
)


🚨 Rule:

User phải có ít nhất 1 group

Không cho xóa group cuối cùng của user

5. roles (định nghĩa role)
roles (
  id
  name            -- e.g. Admin, Moderator
  code            -- ADMIN, MODERATOR
  description
  created_at
)

6. permissions (atomic)
permissions (
  id
  code            -- POST_CREATE, USER_DELETE
  description
  module
)

7. role_permissions
role_permissions (
  role_id         -- FK -> roles.id
  permission_id   -- FK -> permissions.id

  PRIMARY KEY (role_id, permission_id)
)

8. user_role_assignments (CORE)
user_role_assignments (
  id
  user_id         -- FK -> users.id
  role_id         -- FK -> roles.id
  group_id        -- FK -> groups.id
  created_at

  UNIQUE (user_id, role_id, group_id)
)


📌 Role chỉ có hiệu lực trong group

9. (KHUYẾN NGHỊ) role_contexts – chống gán sai scope
role_contexts (
  role_id
  context_id

  PRIMARY KEY (role_id, context_id)
)


📌 Role chỉ được dùng trong context đã khai báo

II. LUỒNG NGHIỆP VỤ (FLOW)
1. Tạo user

Create user

Bắt buộc gán vào ≥ 1 group (user_groups)

Nếu chưa có group → user không active

2. Gán role cho user

Input:

user_id

role_id

group_id

Check bắt buộc:

User ∈ group (user_groups)

Group tồn tại

Role được phép trong context của group
(role_contexts.role_id = role_id AND role_contexts.context_id = group.context_id)

Chưa tồn tại (user_id, role_id, group_id)

→ Insert user_role_assignments

3. Check quyền khi user thao tác
Input:

user_id

group_id

permission_code

Flow:

Check user ∈ group
(user_groups)

Query permission:

SELECT 1
FROM user_role_assignments ura
JOIN role_permissions rp ON rp.role_id = ura.role_id
JOIN permissions p ON p.id = rp.permission_id
WHERE ura.user_id = :user_id
AND ura.group_id = :group_id
AND p.code = :permission_code
LIMIT 1;


→ Có record → ALLOW
→ Không → DENY

4. Admin / System quyền cao
Cách làm:

Tạo context = SYSTEM

Tạo group = SYSTEM_ADMIN

Admin ∈ SYSTEM_ADMIN group

Gán role ADMIN cho admin trong group này

📌 Admin KHÔNG phải ngoại lệ

III. INDEX BẮT BUỘC (HIỆU NĂNG)
-- user_groups
INDEX(user_id)
INDEX(group_id)

-- user_role_assignments
INDEX(user_id, group_id)
INDEX(group_id)
INDEX(role_id)

-- groups
INDEX(context_id)

IV. CÁC ĐIỂM CẦN CHÚ Ý (RẤT QUAN TRỌNG)
1. Không cho user không có group

→ validate ở BE + DB constraint

2. Không cho gán role nếu user chưa thuộc group
3. Không cho gán role sai context

→ dùng role_contexts

4. Không auto kế thừa quyền giữa group

→ mỗi group là boundary độc lập

5. Context KHÔNG phải scope quyền

→ chỉ dùng để tổ chức & validate

V. MỘT CÂU CHỐT GỬI ĐỘI BE

“Group là scope duy nhất để gán và kiểm tra quyền.
Context chỉ là cấu trúc cha để tổ chức group và validate role.”