using DataAccess.Data;
using DataAccess.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Repository
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly HONOrdersDbContex _context;
        protected readonly DbSet<T> _db;

        public Repository(HONOrdersDbContex context)
        {
            _context = context;
            _db = _context.Set<T>();
        }

        public async Task<T?> GetAsync(int id) 
        {
            return await _db.FindAsync(id);
        }

        public async Task<List<T>> GetAllAsync()
        {
            return await _db.ToListAsync();
        }

        public async Task AddAsync(T entity)
        {
            _db.Add(entity);
        }

        public void Remove(T entity)
        {
            _db.Remove(entity);
        }

        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }

    }

}
