using DataAccess.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Repository
{
    public interface IRepository<T> where T : class
    {
        Task<T?> GetAsync(int id);
        Task<List<T>> GetAllAsync();
        Task AddAsync(T entity);
        Task SaveAsync();
    }
}
