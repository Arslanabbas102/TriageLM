import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SimulatedUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
}

export type UserRole = "customer" | "manager" | "admin";
export const USER_ROLES: UserRole[] = ["customer", "manager", "admin"];

export interface NewUserInput {
  name: string;
  email: string;
  role: UserRole;
  user_id?: string; // optional — generated from the role when omitted
}

export function useUsers() {
  return useQuery({
    queryKey: ["simulated-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("simulated_users")
        .select("*")
        .order("role", { ascending: false });
      if (error) throw error;
      return data as SimulatedUser[];
    },
  });
}

/**
 * Builds the next sequential id for a role (user_009, admin_002, …) by looking
 * at what already exists, so generated ids stay consistent with the seed data.
 */
async function nextUserId(role: UserRole): Promise<string> {
  const prefix = role === "customer" ? "user" : role;
  const { data, error } = await supabase
    .from("simulated_users")
    .select("user_id")
    .like("user_id", `${prefix}_%`);
  if (error) throw error;

  const highest = (data ?? []).reduce((max, row: { user_id: string }) => {
    const n = parseInt(row.user_id.slice(prefix.length + 1), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);

  return `${prefix}_${String(highest + 1).padStart(3, "0")}`;
}

export function useCreateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: NewUserInput): Promise<SimulatedUser> => {
      const user_id = input.user_id?.trim() || (await nextUserId(input.role));

      const { data, error } = await supabase
        .from("simulated_users")
        .insert([{
          user_id,
          name: input.name.trim(),
          email: input.email.trim(),
          role: input.role,
        }])
        .select()
        .single();

      if (error) {
        // 23505 = unique_violation on user_id
        if (error.code === "23505") {
          throw new Error(`The user ID "${user_id}" is already taken. Choose another.`);
        }
        throw error;
      }
      return data as SimulatedUser;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["simulated-users"] });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["complaint-stats"] });
    },
  });
}
