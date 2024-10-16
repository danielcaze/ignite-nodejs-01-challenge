export class Task {
  id = "";
  title = "";
  description = "";
  completed_at = null;
  created_at = null;
  updated_at = null;

  constructor(
    title = "",
    description = "",
    id,
    completed_at = null,
    created_at,
    updated_at
  ) {
    this.title = title;
    this.description = description;
    this.id = id || crypto.randomUUID();
    this.completed_at = completed_at;
    this.created_at = created_at || Date.now();
    this.updated_at = updated_at || this.created_at;
  }
}
