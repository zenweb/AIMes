CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;
CREATE EXTENSION IF NOT EXISTS hstore;

CREATE TABLE chat_messages (
    id text NOT NULL,
    session_id character varying(50) NOT NULL,
    role character varying(20) NOT NULL,
    content text NOT NULL,
    timestamp timestamp with time zone NOT NULL,
    "SourceDocumentIds" text[] NOT NULL,
    CONSTRAINT "PK_chat_messages" PRIMARY KEY (id)
);

CREATE TABLE document_chunks (
    id text NOT NULL,
    content text NOT NULL,
    "Metadata" hstore NOT NULL,
    vector real[] NOT NULL,
    source character varying(500) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    CONSTRAINT "PK_document_chunks" PRIMARY KEY (id)
);

CREATE TABLE equipment (
    id text NOT NULL,
    equipment_code character varying(50) NOT NULL,
    equipment_name character varying(200) NOT NULL,
    equipment_type character varying(50) NOT NULL,
    workshop_id character varying(50) NOT NULL,
    workshop_name character varying(200) NOT NULL,
    status text NOT NULL,
    capacity double precision NOT NULL,
    utilization_rate double precision NOT NULL,
    last_maintenance_date timestamp with time zone,
    next_maintenance_date timestamp with time zone,
    current_work_order_id character varying(50) NOT NULL,
    "Parameters" hstore NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT "PK_equipment" PRIMARY KEY (id)
);

CREATE TABLE equipment_telemetry (
    id text NOT NULL,
    equipment_id character varying(50) NOT NULL,
    timestamp timestamp with time zone NOT NULL,
    error_code character varying(50) NOT NULL,
    error_message character varying(500) NOT NULL,
    CONSTRAINT "PK_equipment_telemetry" PRIMARY KEY (id)
);

CREATE TABLE maintenance_records (
    id text NOT NULL,
    equipment_id character varying(50) NOT NULL,
    maintenance_type character varying(50) NOT NULL,
    description character varying(1000) NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone,
    performed_by character varying(100) NOT NULL,
    "SparePartsUsed" text[] NOT NULL,
    result character varying(500) NOT NULL,
    cost numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    CONSTRAINT "PK_maintenance_records" PRIMARY KEY (id)
);

CREATE TABLE materials (
    id text NOT NULL,
    material_code character varying(50) NOT NULL,
    material_name character varying(200) NOT NULL,
    material_type character varying(50) NOT NULL,
    unit character varying(20) NOT NULL,
    available_quantity integer NOT NULL,
    reserved_quantity integer NOT NULL,
    safety_stock integer NOT NULL,
    storage_location character varying(100) NOT NULL,
    expiry_date timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT "PK_materials" PRIMARY KEY (id)
);

CREATE TABLE quality_inspections (
    id text NOT NULL,
    work_order_id character varying(50) NOT NULL,
    product_code character varying(50) NOT NULL,
    process_name character varying(100) NOT NULL,
    inspection_point character varying(100) NOT NULL,
    inspection_quantity integer NOT NULL,
    qualified_quantity integer NOT NULL,
    defect_quantity integer NOT NULL,
    result text NOT NULL,
    inspector_id character varying(50) NOT NULL,
    inspected_at timestamp with time zone NOT NULL,
    CONSTRAINT "PK_quality_inspections" PRIMARY KEY (id)
);

CREATE TABLE schedule_plans (
    id text NOT NULL,
    plan_name character varying(200) NOT NULL,
    plan_start_date timestamp with time zone NOT NULL,
    plan_end_date timestamp with time zone NOT NULL,
    overall_utilization_rate double precision NOT NULL,
    on_time_delivery_rate double precision NOT NULL,
    optimization_notes character varying(1000) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT "PK_schedule_plans" PRIMARY KEY (id)
);

CREATE TABLE work_orders (
    id text NOT NULL,
    order_number character varying(50) NOT NULL,
    product_code character varying(50) NOT NULL,
    product_name character varying(200) NOT NULL,
    planned_quantity integer NOT NULL,
    completed_quantity integer NOT NULL,
    planned_start_date timestamp with time zone NOT NULL,
    planned_end_date timestamp with time zone NOT NULL,
    actual_start_date timestamp with time zone,
    actual_end_date timestamp with time zone,
    status text NOT NULL,
    workshop_id character varying(50) NOT NULL,
    route_code character varying(50) NOT NULL,
    priority integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT "PK_work_orders" PRIMARY KEY (id)
);

CREATE TABLE defect_records (
    "QualityInspectionId" text NOT NULL,
    "Id" integer GENERATED BY DEFAULT AS IDENTITY,
    "DefectType" text NOT NULL,
    "Quantity" integer NOT NULL,
    "AreaRatio" double precision NOT NULL,
    "Severity" text NOT NULL,
    "CorrectiveAction" text NOT NULL,
    CONSTRAINT "PK_defect_records" PRIMARY KEY ("QualityInspectionId", "Id"),
    CONSTRAINT "FK_defect_records_quality_inspections_QualityInspectionId" FOREIGN KEY ("QualityInspectionId") REFERENCES quality_inspections (id) ON DELETE CASCADE
);

CREATE TABLE schedule_items (
    id text NOT NULL,
    work_order_id character varying(50) NOT NULL,
    equipment_id character varying(50) NOT NULL,
    planned_start_time timestamp with time zone NOT NULL,
    planned_end_time timestamp with time zone NOT NULL,
    sequence integer NOT NULL,
    setup_time character varying(50) NOT NULL,
    "DependentItems" text[] NOT NULL,
    "SchedulePlanId" text,
    CONSTRAINT "PK_schedule_items" PRIMARY KEY (id),
    CONSTRAINT "FK_schedule_items_schedule_plans_SchedulePlanId" FOREIGN KEY ("SchedulePlanId") REFERENCES schedule_plans (id) ON DELETE CASCADE
);

INSERT INTO equipment (id, capacity, created_at, current_work_order_id, equipment_code, equipment_name, equipment_type, last_maintenance_date, next_maintenance_date, "Parameters", status, updated_at, utilization_rate, workshop_id, workshop_name)
VALUES ('eq-001', 100.0, TIMESTAMPTZ '2024-01-01T00:00:00Z', '', 'CNC-001', 'CNC加工中心1号', 'CNC', NULL, NULL, HSTORE ', 'Available', NULL, 0.0, 'ws-001', '精密加工车间');
INSERT INTO equipment (id, capacity, created_at, current_work_order_id, equipment_code, equipment_name, equipment_type, last_maintenance_date, next_maintenance_date, "Parameters", status, updated_at, utilization_rate, workshop_id, workshop_name)
VALUES ('eq-002', 100.0, TIMESTAMPTZ '2024-01-01T00:00:00Z', '', 'CNC-002', 'CNC加工中心2号', 'CNC', NULL, NULL, HSTORE ', 'Available', NULL, 0.0, 'ws-001', '精密加工车间');

INSERT INTO materials (id, available_quantity, created_at, expiry_date, material_code, material_name, material_type, reserved_quantity, safety_stock, storage_location, unit, updated_at)
VALUES ('mat-001', 1000, TIMESTAMPTZ '2024-01-01T00:00:00Z', NULL, 'AL-6061', '铝合金6061', '原材料', 0, 100, 'A-01-01', 'KG', NULL);

CREATE INDEX "IX_chat_messages_session_id" ON chat_messages (session_id);

CREATE INDEX "IX_chat_messages_timestamp" ON chat_messages (timestamp);

CREATE INDEX "IX_document_chunks_source" ON document_chunks (source);

CREATE UNIQUE INDEX "IX_equipment_equipment_code" ON equipment (equipment_code);

CREATE INDEX "IX_equipment_status" ON equipment (status);

CREATE INDEX "IX_equipment_workshop_id" ON equipment (workshop_id);

CREATE INDEX "IX_equipment_telemetry_equipment_id" ON equipment_telemetry (equipment_id);

CREATE INDEX "IX_equipment_telemetry_timestamp" ON equipment_telemetry (timestamp);

CREATE INDEX "IX_maintenance_records_equipment_id" ON maintenance_records (equipment_id);

CREATE UNIQUE INDEX "IX_materials_material_code" ON materials (material_code);

CREATE INDEX "IX_quality_inspections_inspected_at" ON quality_inspections (inspected_at);

CREATE INDEX "IX_quality_inspections_product_code" ON quality_inspections (product_code);

CREATE INDEX "IX_quality_inspections_work_order_id" ON quality_inspections (work_order_id);

CREATE INDEX "IX_schedule_items_equipment_id" ON schedule_items (equipment_id);

CREATE INDEX "IX_schedule_items_SchedulePlanId" ON schedule_items ("SchedulePlanId");

CREATE INDEX "IX_schedule_items_work_order_id" ON schedule_items (work_order_id);

CREATE UNIQUE INDEX "IX_work_orders_order_number" ON work_orders (order_number);

CREATE INDEX "IX_work_orders_planned_start_date" ON work_orders (planned_start_date);

CREATE INDEX "IX_work_orders_status" ON work_orders (status);

CREATE INDEX "IX_work_orders_workshop_id" ON work_orders (workshop_id);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260510220003_InitialCreate', '9.0.0');

CREATE TABLE audit_logs (
    id text NOT NULL,
    user_id character varying(100) NOT NULL,
    action character varying(100) NOT NULL,
    resource character varying(200) NOT NULL,
    resource_id character varying(100),
    old_values jsonb,
    new_values jsonb,
    ip_address character varying(100),
    user_agent character varying(500),
    created_at timestamp with time zone NOT NULL,
    CONSTRAINT "PK_audit_logs" PRIMARY KEY (id)
);

CREATE INDEX "IX_audit_logs_created_at" ON audit_logs (created_at);

CREATE INDEX "IX_audit_logs_resource" ON audit_logs (resource);

CREATE INDEX "IX_audit_logs_resource_id" ON audit_logs (resource_id);

CREATE INDEX "IX_audit_logs_user_id" ON audit_logs (user_id);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260511003822_AddAuditLog', '9.0.0');

CREATE TABLE ai_decision_traces (
    trace_id text NOT NULL,
    agent_name character varying(100) NOT NULL,
    agent_version character varying(50) NOT NULL,
    model_provider character varying(50) NOT NULL,
    model_name character varying(100) NOT NULL,
    model_version character varying(50) NOT NULL,
    prompt_hash character varying(100) NOT NULL,
    context_hash character varying(100) NOT NULL,
    input_summary jsonb,
    output_summary jsonb,
    confidence numeric(3,2),
    tokens_input integer,
    tokens_output integer,
    latency_ms integer NOT NULL,
    human_adoption_status text NOT NULL,
    source_references jsonb,
    related_business_keys jsonb,
    created_at timestamp with time zone NOT NULL,
    CONSTRAINT "PK_ai_decision_traces" PRIMARY KEY (trace_id)
);

CREATE INDEX "IX_ai_decision_traces_agent_name" ON ai_decision_traces (agent_name);

CREATE INDEX "IX_ai_decision_traces_created_at" ON ai_decision_traces (created_at);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260511081723_AddAiDecisionTrace', '9.0.0');

COMMIT;

