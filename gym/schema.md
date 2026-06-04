gyms
- id UUID PK
- user_id UUID  -- references users, not FK across services, just a convention
- name VARCHAR
- location VARCHAR
- notes TEXT
- created_at TIMESTAMP