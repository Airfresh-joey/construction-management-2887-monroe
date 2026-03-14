import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useTable<T>(table: string, orderBy?: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from(table).select('*');
    if (orderBy) query = query.order(orderBy);
    const { data: rows, error } = await query;
    if (error) console.error(`Error fetching ${table}:`, error);
    else setData((rows as T[]) || []);
    setLoading(false);
  }, [table, orderBy]);

  useEffect(() => { fetch(); }, [fetch]);

  const update = async (id: string, updates: Partial<T>) => {
    const { error } = await supabase.from(table).update(updates).eq('id', id);
    if (error) console.error(`Error updating ${table}:`, error);
    else await fetch();
  };

  const insert = async (record: Partial<T>) => {
    const { error } = await supabase.from(table).insert(record);
    if (error) console.error(`Error inserting into ${table}:`, error);
    else await fetch();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) console.error(`Error deleting from ${table}:`, error);
    else await fetch();
  };

  return { data, loading, refetch: fetch, update, insert, remove };
}
