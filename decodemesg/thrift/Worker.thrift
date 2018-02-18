struct WorkerRange
{
  1: i64 first,
  2: i64 last
}

service Worker {
  /**
   * Logins to a worker.
   *
   * @return a new worker identifier
   */
   string login();

   /**
    * Logouts from a worker.
    *
    * @param worker_id the worker identifier
    */
   void logout(1: string worker_id);

   /**
    * Reserves a range.
    *
    * @return a reserved range
    */
   WorkerRange reserve();

   /**
    * Reports results.
    *
    * @param range the requested range
    * @param results the list of found numbers.
    */
   void report(1: WorkerRange range, 2: list<string> results);
}
