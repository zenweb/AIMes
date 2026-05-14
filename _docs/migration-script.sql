CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE EXTENSION IF NOT EXISTS hstore;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE TABLE chat_messages (
        id text NOT NULL,
        session_id character varying(50) NOT NULL,
        role character varying(20) NOT NULL,
        content text NOT NULL,
        timestamp timestamp with time zone NOT NULL,
        "SourceDocumentIds" text[] NOT NULL,
        CONSTRAINT "PK_chat_messages" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE TABLE document_chunks (
        id text NOT NULL,
        content text NOT NULL,
        "Metadata" hstore NOT NULL,
        vector real[] NOT NULL,
        source character varying(500) NOT NULL,
        created_at timestamp with time zone NOT NULL,
        CONSTRAINT "PK_document_chunks" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
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
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE TABLE equipment_telemetry (
        id text NOT NULL,
        equipment_id character varying(50) NOT NULL,
        timestamp timestamp with time zone NOT NULL,
        error_code character varying(50) NOT NULL,
        error_message character varying(500) NOT NULL,
        CONSTRAINT "PK_equipment_telemetry" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
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
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
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
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
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
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
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
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
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
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
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
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
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
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    INSERT INTO equipment (id, capacity, created_at, current_work_order_id, equipment_code, equipment_name, equipment_type, last_maintenance_date, next_maintenance_date, "Parameters", status, updated_at, utilization_rate, workshop_id, workshop_name)
    VALUES ('eq-001', 100.0, TIMESTAMPTZ '2024-01-01T00:00:00Z', '', 'CNC-001', 'CNC加工中心1号', 'CNC', NULL, NULL, HSTORE ', 'Available', NULL, 0.0, 'ws-001', '精密加工车间');
    INSERT INTO equipment (id, capacity, created_at, current_work_order_id, equipment_code, equipment_name, equipment_type, last_maintenance_date, next_maintenance_date, "Parameters", status, updated_at, utilization_rate, workshop_id, workshop_name)
    VALUES ('eq-002', 100.0, TIMESTAMPTZ '2024-01-01T00:00:00Z', '', 'CNC-002', 'CNC加工中心2号', 'CNC', NULL, NULL, HSTORE ', 'Available', NULL, 0.0, 'ws-001', '精密加工车间');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    INSERT INTO materials (id, available_quantity, created_at, expiry_date, material_code, material_name, material_type, reserved_quantity, safety_stock, storage_location, unit, updated_at)
    VALUES ('mat-001', 1000, TIMESTAMPTZ '2024-01-01T00:00:00Z', NULL, 'AL-6061', '铝合金6061', '原材料', 0, 100, 'A-01-01', 'KG', NULL);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE INDEX "IX_chat_messages_session_id" ON chat_messages (session_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE INDEX "IX_chat_messages_timestamp" ON chat_messages (timestamp);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE INDEX "IX_document_chunks_source" ON document_chunks (source);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_equipment_equipment_code" ON equipment (equipment_code);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE INDEX "IX_equipment_status" ON equipment (status);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE INDEX "IX_equipment_workshop_id" ON equipment (workshop_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE INDEX "IX_equipment_telemetry_equipment_id" ON equipment_telemetry (equipment_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE INDEX "IX_equipment_telemetry_timestamp" ON equipment_telemetry (timestamp);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE INDEX "IX_maintenance_records_equipment_id" ON maintenance_records (equipment_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_materials_material_code" ON materials (material_code);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE INDEX "IX_quality_inspections_inspected_at" ON quality_inspections (inspected_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE INDEX "IX_quality_inspections_product_code" ON quality_inspections (product_code);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE INDEX "IX_quality_inspections_work_order_id" ON quality_inspections (work_order_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE INDEX "IX_schedule_items_equipment_id" ON schedule_items (equipment_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE INDEX "IX_schedule_items_SchedulePlanId" ON schedule_items ("SchedulePlanId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE INDEX "IX_schedule_items_work_order_id" ON schedule_items (work_order_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_work_orders_order_number" ON work_orders (order_number);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE INDEX "IX_work_orders_planned_start_date" ON work_orders (planned_start_date);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE INDEX "IX_work_orders_status" ON work_orders (status);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    CREATE INDEX "IX_work_orders_workshop_id" ON work_orders (workshop_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260510220003_InitialCreate') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260510220003_InitialCreate', '9.0.0');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260511003822_AddAuditLog') THEN
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
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260511003822_AddAuditLog') THEN
    CREATE INDEX "IX_audit_logs_created_at" ON audit_logs (created_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260511003822_AddAuditLog') THEN
    CREATE INDEX "IX_audit_logs_resource" ON audit_logs (resource);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260511003822_AddAuditLog') THEN
    CREATE INDEX "IX_audit_logs_resource_id" ON audit_logs (resource_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260511003822_AddAuditLog') THEN
    CREATE INDEX "IX_audit_logs_user_id" ON audit_logs (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260511003822_AddAuditLog') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260511003822_AddAuditLog', '9.0.0');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260511081723_AddAiDecisionTrace') THEN
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
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260511081723_AddAiDecisionTrace') THEN
    CREATE INDEX "IX_ai_decision_traces_agent_name" ON ai_decision_traces (agent_name);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260511081723_AddAiDecisionTrace') THEN
    CREATE INDEX "IX_ai_decision_traces_created_at" ON ai_decision_traces (created_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260511081723_AddAiDecisionTrace') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260511081723_AddAiDecisionTrace', '9.0.0');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    ALTER TABLE document_chunks DROP COLUMN "Metadata";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    ALTER TABLE document_chunks DROP COLUMN vector;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    ALTER TABLE audit_logs ALTER COLUMN old_values TYPE text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    ALTER TABLE audit_logs ALTER COLUMN new_values TYPE text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    ALTER TABLE ai_decision_traces ALTER COLUMN source_references TYPE text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    ALTER TABLE ai_decision_traces ALTER COLUMN related_business_keys TYPE text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    ALTER TABLE ai_decision_traces ALTER COLUMN output_summary TYPE text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    ALTER TABLE ai_decision_traces ALTER COLUMN input_summary TYPE text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE TABLE bills_of_material (
        id text NOT NULL,
        bom_code character varying(50) NOT NULL,
        bom_name character varying(200) NOT NULL,
        product_code character varying(50) NOT NULL,
        product_name character varying(200) NOT NULL,
        bom_type text NOT NULL,
        version text NOT NULL,
        bom_version_status text NOT NULL,
        effective_date timestamp with time zone,
        expire_date timestamp with time zone,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        CONSTRAINT "PK_bills_of_material" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE TABLE employees (
        id text NOT NULL,
        employee_number character varying(50) NOT NULL,
        name character varying(100) NOT NULL,
        phone character varying(30),
        email character varying(200),
        role character varying(50) NOT NULL,
        team character varying(100),
        shift character varying(50),
        is_active boolean NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        CONSTRAINT "PK_employees" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE TABLE operation_executions (
        id text NOT NULL,
        work_order_id character varying(50) NOT NULL,
        operation_code character varying(50) NOT NULL,
        operation_name character varying(200) NOT NULL,
        status text NOT NULL,
        operator_id character varying(50),
        station_id character varying(50),
        equipment_id character varying(50),
        suspend_reason character varying(500),
        exception_reason character varying(500),
        completed_quantity integer NOT NULL,
        started_at timestamp with time zone,
        paused_at timestamp with time zone,
        completed_at timestamp with time zone,
        failed_at timestamp with time zone,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        version bigint NOT NULL,
        CONSTRAINT "PK_operation_executions" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE TABLE operation_reports (
        id text NOT NULL,
        work_order_id character varying(50) NOT NULL,
        operation_id character varying(50) NOT NULL,
        reported_quantity integer NOT NULL,
        defect_quantity integer NOT NULL,
        parameters text NOT NULL,
        parameter_captured_at timestamp with time zone NOT NULL,
        inspection_result text NOT NULL,
        reported_by character varying(50),
        reported_at timestamp with time zone NOT NULL,
        version bigint NOT NULL,
        CONSTRAINT "PK_operation_reports" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE TABLE process_routes (
        id text NOT NULL,
        route_code character varying(50) NOT NULL,
        route_name character varying(200) NOT NULL,
        product_code character varying(50) NOT NULL,
        product_name character varying(200) NOT NULL,
        version text NOT NULL,
        status text NOT NULL,
        total_lead_time_minutes double precision,
        CONSTRAINT "PK_process_routes" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE TABLE production_anomalies (
        id text NOT NULL,
        work_order_number character varying(50) NOT NULL,
        operation_code character varying(50) NOT NULL,
        equipment_id character varying(50),
        anomaly_type character varying(100) NOT NULL,
        severity text NOT NULL,
        title character varying(200) NOT NULL,
        description character varying(2000) NOT NULL,
        detected_at timestamp with time zone NOT NULL,
        detected_by character varying(100),
        status text NOT NULL,
        root_cause character varying(1000),
        resolution character varying(1000),
        resolved_at timestamp with time zone,
        resolved_by character varying(100),
        version bigint NOT NULL,
        CONSTRAINT "PK_production_anomalies" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE TABLE purchase_orders (
        id text NOT NULL,
        order_number character varying(50) NOT NULL,
        supplier_name character varying(200) NOT NULL,
        supplier_contact character varying(100),
        status text NOT NULL,
        order_date timestamp with time zone NOT NULL,
        expected_delivery_date timestamp with time zone,
        completed_date timestamp with time zone,
        remark character varying(1000),
        created_by character varying(50) NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        version bigint NOT NULL,
        CONSTRAINT "PK_purchase_orders" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE TABLE stock_transactions (
        id text NOT NULL,
        material_code character varying(50) NOT NULL,
        material_name character varying(200) NOT NULL,
        transaction_type text NOT NULL,
        quantity numeric(18,4) NOT NULL,
        balance_before numeric(18,4) NOT NULL,
        balance_after numeric(18,4) NOT NULL,
        reference_type character varying(50),
        reference_number character varying(50),
        warehouse character varying(100),
        location character varying(100),
        operator character varying(50),
        remark character varying(500),
        created_at timestamp with time zone NOT NULL,
        CONSTRAINT "PK_stock_transactions" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE TABLE system_configs (
        id text NOT NULL,
        config_key character varying(100) NOT NULL,
        config_value character varying(500) NOT NULL,
        description character varying(500),
        category character varying(100),
        updated_at timestamp with time zone NOT NULL,
        updated_by character varying(50),
        CONSTRAINT "PK_system_configs" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE TABLE system_users (
        id text NOT NULL,
        username character varying(50) NOT NULL,
        display_name character varying(100) NOT NULL,
        role character varying(50) NOT NULL,
        is_active boolean NOT NULL,
        created_at timestamp with time zone NOT NULL,
        last_login_at timestamp with time zone,
        CONSTRAINT "PK_system_users" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE TABLE bom_change_records (
        id text NOT NULL,
        change_description character varying(1000) NOT NULL,
        changed_by character varying(100) NOT NULL,
        changed_at timestamp with time zone NOT NULL,
        bom_id text NOT NULL,
        CONSTRAINT "PK_bom_change_records" PRIMARY KEY (id),
        CONSTRAINT "FK_bom_change_records_bills_of_material_bom_id" FOREIGN KEY (bom_id) REFERENCES bills_of_material (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE TABLE bom_items (
        id text NOT NULL,
        material_code character varying(50) NOT NULL,
        material_name character varying(200) NOT NULL,
        quantity numeric(18,4) NOT NULL,
        unit character varying(20) NOT NULL,
        loss_rate numeric(8,4),
        lead_time_days integer,
        consumption_timing character varying(100) NOT NULL,
        sequence integer NOT NULL,
        bom_id text NOT NULL,
        CONSTRAINT "PK_bom_items" PRIMARY KEY (id),
        CONSTRAINT "FK_bom_items_bills_of_material_bom_id" FOREIGN KEY (bom_id) REFERENCES bills_of_material (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE TABLE operation_report_materials (
        id integer GENERATED BY DEFAULT AS IDENTITY,
        material_code character varying(50) NOT NULL,
        quantity numeric NOT NULL,
        unit character varying(20) NOT NULL,
        batch_number character varying(100),
        operation_report_id text NOT NULL,
        CONSTRAINT "PK_operation_report_materials" PRIMARY KEY (id),
        CONSTRAINT "FK_operation_report_materials_operation_reports_operation_repo~" FOREIGN KEY (operation_report_id) REFERENCES operation_reports (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE TABLE routing_steps (
        id text NOT NULL,
        step_sequence integer NOT NULL,
        operation_code character varying(50) NOT NULL,
        operation_name character varying(200) NOT NULL,
        workstation_type character varying(100) NOT NULL,
        standard_setup_minutes double precision NOT NULL,
        standard_run_minutes_per_unit double precision NOT NULL,
        equipment_type character varying(100) NOT NULL,
        inspection_required boolean NOT NULL,
        route_id text NOT NULL,
        CONSTRAINT "PK_routing_steps" PRIMARY KEY (id),
        CONSTRAINT "FK_routing_steps_process_routes_route_id" FOREIGN KEY (route_id) REFERENCES process_routes (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE TABLE anomaly_responses (
        id text NOT NULL,
        response_type text NOT NULL,
        description character varying(1000) NOT NULL,
        suggested_action character varying(1000) NOT NULL,
        suggested_by character varying(100) NOT NULL,
        status text NOT NULL,
        executed_at timestamp with time zone,
        executed_by character varying(100),
        created_at timestamp with time zone NOT NULL,
        ai_trace_id character varying(100),
        ai_agent_name character varying(100),
        ai_agent_version character varying(50),
        ai_model_provider character varying(50),
        ai_model_name character varying(100),
        ai_model_version character varying(50),
        ai_prompt_hash character varying(100),
        ai_context_hash character varying(100),
        ai_input_summary text,
        ai_output_summary text,
        ai_confidence numeric(3,2),
        ai_tokens_input integer,
        ai_tokens_output integer,
        ai_latency_ms integer,
        ai_human_adoption_status text,
        ai_source_references text,
        ai_related_business_keys text,
        ai_created_at timestamp with time zone,
        anomaly_id text NOT NULL,
        CONSTRAINT "PK_anomaly_responses" PRIMARY KEY (id),
        CONSTRAINT "FK_anomaly_responses_production_anomalies_anomaly_id" FOREIGN KEY (anomaly_id) REFERENCES production_anomalies (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE TABLE purchase_order_items (
        id text NOT NULL,
        material_code character varying(50) NOT NULL,
        material_name character varying(200) NOT NULL,
        unit character varying(20) NOT NULL,
        quantity numeric(18,4) NOT NULL,
        received_quantity numeric(18,4) NOT NULL,
        unit_price numeric(18,4) NOT NULL,
        expected_date timestamp with time zone,
        remark character varying(500),
        purchase_order_id text,
        CONSTRAINT "PK_purchase_order_items" PRIMARY KEY (id),
        CONSTRAINT "FK_purchase_order_items_purchase_orders_purchase_order_id" FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE TABLE bom_item_children (
        id text NOT NULL,
        material_code character varying(50) NOT NULL,
        material_name character varying(200) NOT NULL,
        quantity numeric(18,4) NOT NULL,
        unit character varying(20) NOT NULL,
        loss_rate numeric(8,4),
        lead_time_days integer,
        consumption_timing character varying(100) NOT NULL,
        sequence integer NOT NULL,
        parent_item_id text,
        CONSTRAINT "PK_bom_item_children" PRIMARY KEY (id),
        CONSTRAINT "FK_bom_item_children_bom_items_parent_item_id" FOREIGN KEY (parent_item_id) REFERENCES bom_items (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE TABLE routing_step_parameters (
        id text NOT NULL,
        parameter_code character varying(50) NOT NULL,
        parameter_name character varying(100) NOT NULL,
        default_value character varying(200) NOT NULL,
        unit character varying(20) NOT NULL,
        upper_limit double precision,
        lower_limit double precision,
        is_mandatory boolean NOT NULL,
        routing_step_id text,
        CONSTRAINT "PK_routing_step_parameters" PRIMARY KEY (id),
        CONSTRAINT "FK_routing_step_parameters_routing_steps_routing_step_id" FOREIGN KEY (routing_step_id) REFERENCES routing_steps (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    INSERT INTO employees (id, created_at, email, employee_number, is_active, name, phone, role, shift, team, updated_at)
    VALUES ('emp-001', TIMESTAMPTZ '2024-01-01T00:00:00Z', NULL, 'EMP-001', TRUE, '张三', NULL, 'Operator', 'Day', '班组A', NULL);
    INSERT INTO employees (id, created_at, email, employee_number, is_active, name, phone, role, shift, team, updated_at)
    VALUES ('emp-002', TIMESTAMPTZ '2024-01-01T00:00:00Z', NULL, 'EMP-002', TRUE, '李四', NULL, 'Engineer', 'Day', '班组A', NULL);
    INSERT INTO employees (id, created_at, email, employee_number, is_active, name, phone, role, shift, team, updated_at)
    VALUES ('emp-003', TIMESTAMPTZ '2024-01-01T00:00:00Z', NULL, 'EMP-003', TRUE, '王五', NULL, 'Lead', 'Day', '班组A', NULL);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    INSERT INTO system_configs (id, category, config_key, config_value, description, updated_at, updated_by)
    VALUES ('sc-001', '基本设置', 'site.name', 'AIMes 制造执行系统', '站点名称', TIMESTAMPTZ '2024-01-01T00:00:00Z', 'admin');
    INSERT INTO system_configs (id, category, config_key, config_value, description, updated_at, updated_by)
    VALUES ('sc-002', '排班设置', 'shift.morning.start', '08:00', '早班开始时间', TIMESTAMPTZ '2024-01-01T00:00:00Z', 'admin');
    INSERT INTO system_configs (id, category, config_key, config_value, description, updated_at, updated_by)
    VALUES ('sc-003', '排班设置', 'shift.morning.end', '20:00', '早班结束时间', TIMESTAMPTZ '2024-01-01T00:00:00Z', 'admin');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    INSERT INTO system_users (id, created_at, display_name, is_active, last_login_at, role, username)
    VALUES ('su-001', TIMESTAMPTZ '2024-01-01T00:00:00Z', '管理员', TRUE, NULL, 'Admin', 'admin');
    INSERT INTO system_users (id, created_at, display_name, is_active, last_login_at, role, username)
    VALUES ('su-002', TIMESTAMPTZ '2024-01-01T00:00:00Z', '操作员1', TRUE, NULL, 'Operator', 'operator1');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_anomaly_responses_anomaly_id" ON anomaly_responses (anomaly_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE UNIQUE INDEX "IX_bills_of_material_bom_code" ON bills_of_material (bom_code);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_bom_change_records_bom_id" ON bom_change_records (bom_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_bom_item_children_parent_item_id" ON bom_item_children (parent_item_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_bom_items_bom_id" ON bom_items (bom_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE UNIQUE INDEX "IX_employees_employee_number" ON employees (employee_number);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_employees_role" ON employees (role);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_employees_team" ON employees (team);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_operation_executions_operation_code" ON operation_executions (operation_code);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_operation_executions_status" ON operation_executions (status);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_operation_executions_work_order_id" ON operation_executions (work_order_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_operation_report_materials_operation_report_id" ON operation_report_materials (operation_report_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_operation_reports_operation_id" ON operation_reports (operation_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_operation_reports_reported_at" ON operation_reports (reported_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_operation_reports_work_order_id" ON operation_reports (work_order_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE UNIQUE INDEX "IX_process_routes_route_code" ON process_routes (route_code);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_purchase_order_items_purchase_order_id" ON purchase_order_items (purchase_order_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE UNIQUE INDEX "IX_purchase_orders_order_number" ON purchase_orders (order_number);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_purchase_orders_status" ON purchase_orders (status);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_purchase_orders_supplier_name" ON purchase_orders (supplier_name);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_routing_step_parameters_routing_step_id" ON routing_step_parameters (routing_step_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_routing_steps_route_id" ON routing_steps (route_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_stock_transactions_created_at" ON stock_transactions (created_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_stock_transactions_material_code" ON stock_transactions (material_code);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE INDEX "IX_stock_transactions_transaction_type" ON stock_transactions (transaction_type);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE UNIQUE INDEX "IX_system_configs_config_key" ON system_configs (config_key);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    CREATE UNIQUE INDEX "IX_system_users_username" ON system_users (username);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260512051801_AddInventoryPurchaseEmployeeAdmin') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260512051801_AddInventoryPurchaseEmployeeAdmin', '9.0.0');
    END IF;
END $EF$;
COMMIT;

