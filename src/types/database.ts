export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      // ─── Foundation ───────────────────────────────────────
      school_settings: {
        Row: {
          id: number;
          school_name: string;
          short_name: string | null;
          motto: string | null;
          logo_url: string | null;
          favicon_url: string | null;
          address: string | null;
          phone_primary: string | null;
          phone_secondary: string | null;
          email_primary: string | null;
          email_admissions: string | null;
          website: string | null;
          history: string | null;
          vision: string | null;
          mission: string | null;
          core_values: Json;
          principal_name: string | null;
          principal_message: string | null;
          social_links: Json;
          footer_text: string | null;
          brand_colors: Json;
          passport_photo: Json;
          locale: string;
          timezone: string;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          school_name?: string;
          short_name?: string | null;
          motto?: string | null;
          logo_url?: string | null;
          favicon_url?: string | null;
          address?: string | null;
          phone_primary?: string | null;
          phone_secondary?: string | null;
          email_primary?: string | null;
          email_admissions?: string | null;
          website?: string | null;
          history?: string | null;
          vision?: string | null;
          mission?: string | null;
          core_values?: Json;
          principal_name?: string | null;
          principal_message?: string | null;
          social_links?: Json;
          footer_text?: string | null;
          brand_colors?: Json;
          passport_photo?: Json;
          locale?: string;
          timezone?: string;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["school_settings"]["Insert"]>;
        Relationships: [];
      };
      system_lists: {
        Row: {
          id: string;
          list_key: string;
          item_key: string;
          item_label: string;
          sort_order: number;
          metadata: Json;
          is_active: boolean;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          list_key: string;
          item_key: string;
          item_label: string;
          sort_order?: number;
          metadata?: Json;
          is_active?: boolean;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["system_lists"]["Insert"]>;
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: number;
          actor_id: string | null;
          actor_email: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          before: Json | null;
          after: Json | null;
          ip: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          actor_id?: string | null;
          actor_email?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          before?: Json | null;
          after?: Json | null;
          ip?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_log"]["Insert"]>;
        Relationships: [];
      };
      // ─── Identity ─────────────────────────────────────────
      roles: {
        Row: {
          id: string;
          key: string;
          name: string;
          description: string | null;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          name: string;
          description?: string | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["roles"]["Insert"]>;
        Relationships: [];
      };
      permissions: {
        Row: {
          id: string;
          key: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["permissions"]["Insert"]>;
        Relationships: [];
      };
      role_permissions: {
        Row: { role_id: string; permission_id: string };
        Insert: { role_id: string; permission_id: string };
        Update: Partial<Database["public"]["Tables"]["role_permissions"]["Insert"]>;
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          role: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
          must_change_pw: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          must_change_pw?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [];
      };
      // ─── Academics ────────────────────────────────────────
      academic_sessions: {
        Row: {
          id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["academic_sessions"]["Insert"]>;
        Relationships: [];
      };
      terms: {
        Row: {
          id: string;
          session_id: string;
          name: string;
          start_date: string | null;
          end_date: string | null;
          is_current: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          name: string;
          start_date?: string | null;
          end_date?: string | null;
          is_current?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["terms"]["Insert"]>;
        Relationships: [];
      };
      departments: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["departments"]["Insert"]>;
        Relationships: [];
      };
      classes: {
        Row: {
          id: string;
          name: string;
          level: number | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          level?: number | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["classes"]["Insert"]>;
        Relationships: [];
      };
      class_arms: {
        Row: {
          id: string;
          class_id: string;
          arm_name: string;
          class_teacher_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          arm_name: string;
          class_teacher_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["class_arms"]["Insert"]>;
        Relationships: [];
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          code: string;
          department_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          department_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subjects"]["Insert"]>;
        Relationships: [];
      };
      class_subjects: {
        Row: { class_id: string; subject_id: string };
        Insert: { class_id: string; subject_id: string };
        Update: Partial<Database["public"]["Tables"]["class_subjects"]["Insert"]>;
        Relationships: [];
      };
      teacher_assignments: {
        Row: {
          id: string;
          staff_id: string;
          subject_id: string;
          class_arm_id: string;
          term_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          staff_id: string;
          subject_id: string;
          class_arm_id: string;
          term_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["teacher_assignments"]["Insert"]>;
        Relationships: [];
      };
      assessment_components: {
        Row: {
          id: string;
          term_id: string;
          name: string;
          weight: number;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          term_id: string;
          name: string;
          weight: number;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["assessment_components"]["Insert"]>;
        Relationships: [];
      };
      grading_schemes: {
        Row: {
          id: string;
          name: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["grading_schemes"]["Insert"]>;
        Relationships: [];
      };
      grade_bands: {
        Row: {
          id: string;
          scheme_id: string;
          grade: string;
          min_score: number;
          max_score: number;
          remark: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          scheme_id: string;
          grade: string;
          min_score: number;
          max_score: number;
          remark?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["grade_bands"]["Insert"]>;
        Relationships: [];
      };
      // ─── Enrolments ───────────────────────────────────────
      enrolments: {
        Row: {
          id: string;
          student_id: string;
          class_arm_id: string;
          term_id: string;
          session_id: string;
          status: string;
          enrolled_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          class_arm_id: string;
          term_id: string;
          session_id: string;
          status?: string;
          enrolled_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["enrolments"]["Insert"]>;
        Relationships: [];
      };
      // ─── People ───────────────────────────────────────────
      students: {
        Row: {
          id: string;
          admission_no: string;
          surname: string;
          first_name: string;
          other_names: string | null;
          gender: string;
          date_of_birth: string | null;
          photo_path: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          state_of_origin: string | null;
          lga: string | null;
          nationality: string | null;
          religion: string | null;
          blood_group: string | null;
          genotype: string | null;
          previous_school: string | null;
          admission_date: string | null;
          status: string;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          admission_no: string;
          surname: string;
          first_name: string;
          other_names?: string | null;
          gender: string;
          date_of_birth?: string | null;
          photo_path?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          state_of_origin?: string | null;
          lga?: string | null;
          nationality?: string | null;
          religion?: string | null;
          blood_group?: string | null;
          genotype?: string | null;
          previous_school?: string | null;
          admission_date?: string | null;
          status?: string;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["students"]["Insert"]>;
        Relationships: [];
      };
      staff: {
        Row: {
          id: string;
          staff_no: string;
          surname: string;
          first_name: string;
          other_names: string | null;
          gender: string | null;
          date_of_birth: string | null;
          photo_path: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          department_id: string | null;
          designation: string | null;
          qualifications: string | null;
          employment_status: string;
          employment_date: string | null;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          staff_no: string;
          surname: string;
          first_name: string;
          other_names?: string | null;
          gender?: string | null;
          date_of_birth?: string | null;
          photo_path?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          department_id?: string | null;
          designation?: string | null;
          qualifications?: string | null;
          employment_status?: string;
          employment_date?: string | null;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["staff"]["Insert"]>;
        Relationships: [];
      };
      parents: {
        Row: {
          id: string;
          surname: string;
          first_name: string;
          other_names: string | null;
          relationship: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          occupation: string | null;
          photo_path: string | null;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          surname: string;
          first_name: string;
          other_names?: string | null;
          relationship?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          occupation?: string | null;
          photo_path?: string | null;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["parents"]["Insert"]>;
        Relationships: [];
      };
      parent_student: {
        Row: {
          parent_id: string;
          student_id: string;
          relationship: string | null;
          is_primary: boolean;
        };
        Insert: {
          parent_id: string;
          student_id: string;
          relationship?: string | null;
          is_primary?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["parent_student"]["Insert"]>;
        Relationships: [];
      };
      // ─── Attendance ───────────────────────────────────────
      attendance_records: {
        Row: {
          id: string;
          student_id: string;
          class_arm_id: string;
          term_id: string;
          date: string;
          status: string;
          note: string | null;
          recorded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          class_arm_id: string;
          term_id: string;
          date: string;
          status: string;
          note?: string | null;
          recorded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["attendance_records"]["Insert"]>;
        Relationships: [];
      };
      // ─── Timetable ────────────────────────────────────────
      periods: {
        Row: {
          id: string;
          label: string;
          start_time: string;
          end_time: string;
          sort_order: number;
          is_break: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          start_time: string;
          end_time: string;
          sort_order?: number;
          is_break?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["periods"]["Insert"]>;
        Relationships: [];
      };
      timetable_entries: {
        Row: {
          id: string;
          class_arm_id: string;
          term_id: string;
          period_id: string;
          day_of_week: number;
          subject_id: string | null;
          staff_id: string | null;
          room: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_arm_id: string;
          term_id: string;
          period_id: string;
          day_of_week: number;
          subject_id?: string | null;
          staff_id?: string | null;
          room?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["timetable_entries"]["Insert"]>;
        Relationships: [];
      };
      // ─── Results ──────────────────────────────────────────
      result_records: {
        Row: {
          id: string;
          enrolment_id: string;
          subject_id: string;
          component_id: string;
          score: number;
          entered_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          enrolment_id: string;
          subject_id: string;
          component_id: string;
          score: number;
          entered_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["result_records"]["Insert"]>;
        Relationships: [];
      };
      result_submissions: {
        Row: {
          id: string;
          enrolment_id: string;
          subject_id: string;
          term_id: string;
          status: string;
          submitted_by: string | null;
          submitted_at: string | null;
          approved_by: string | null;
          approved_at: string | null;
          published_at: string | null;
          return_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          enrolment_id: string;
          subject_id: string;
          term_id: string;
          status?: string;
          submitted_by?: string | null;
          submitted_at?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          published_at?: string | null;
          return_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["result_submissions"]["Insert"]>;
        Relationships: [];
      };
      // ─── Fees ─────────────────────────────────────────────
      fee_structures: {
        Row: {
          id: string;
          session_id: string;
          term_id: string;
          class_id: string;
          description: string;
          amount: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          term_id: string;
          class_id: string;
          description: string;
          amount: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["fee_structures"]["Insert"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          enrolment_id: string;
          amount: number;
          method: string;
          reference: string | null;
          note: string | null;
          recorded_by: string | null;
          recorded_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          enrolment_id: string;
          amount: number;
          method?: string;
          reference?: string | null;
          note?: string | null;
          recorded_by?: string | null;
          recorded_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      current_role_name: { Args: Record<string, never>; Returns: string };
      my_staff_id: { Args: Record<string, never>; Returns: string };
      my_student_id: { Args: Record<string, never>; Returns: string };
      my_parent_id: { Args: Record<string, never>; Returns: string };
      is_teacher: { Args: Record<string, never>; Returns: boolean };
      can_manage_people: { Args: Record<string, never>; Returns: boolean };
      can_manage_academics: { Args: Record<string, never>; Returns: boolean };
      teaches_arm: { Args: { arm_id: string; term: string }; Returns: boolean };
      is_own_class_arm: { Args: { arm_id: string }; Returns: boolean };
      teaches_enrolment: {
        Args: { enrol_id: string; subject: string; term: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
};