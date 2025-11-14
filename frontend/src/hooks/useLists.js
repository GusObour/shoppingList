import { useState, useEffect, useCallback } from 'react';
import * as listsAPI from '../api/lists';
import toast from 'react-hot-toast';

export const useLists = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLists = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listsAPI.getLists();
      setLists(data.lists || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch lists');
      toast.error('Failed to load lists');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const addList = async (listData) => {
    try {
      const data = await listsAPI.createList(listData);
      setLists((prev) => [data.list, ...prev]);
      toast.success('List created!');
      return { success: true, list: data.list };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create list';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateList = async (listId, updates) => {
    try {
      const data = await listsAPI.updateList(listId, updates);
      setLists((prev) =>
        prev.map((list) => (list._id === listId ? data.list : list))
      );
      toast.success('List updated!');
      return { success: true, list: data.list };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update list';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const deleteList = async (listId) => {
    try {
      await listsAPI.deleteList(listId);
      setLists((prev) => prev.filter((list) => list._id !== listId));
      toast.success('List deleted!');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete list';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  return {
    lists,
    loading,
    error,
    refetch: fetchLists,
    addList,
    updateList,
    deleteList,
  };
};
