using DataAccess.Data;
using EventManagment.DAL.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventManagment.DAL.Repository
{
    public class Repository : IRepository
    {
        private readonly UserDetailDbContext _dbcontext; 
        public Repository(UserDetailDbContext dbContext)
        {
            _dbcontext = dbContext;
        }
        public bool AddUser(UserDetail userDetail)
        {
            if (userDetail == null)
            {
                return false;
            }

            _dbcontext.UserDetails.Add(userDetail);
            return _dbcontext.SaveChanges() > 0;
        }

        public bool EditUser(UserDetail userDetail)
        {
            if (userDetail == null)
            {
                return false;
            }

            var existingUser = _dbcontext.UserDetails.FirstOrDefault(u => u.Id == userDetail.Id);
            if (existingUser == null)
            {
                return false;
            }

            existingUser.FirstName = userDetail.FirstName;
            existingUser.LastName = userDetail.LastName;
            existingUser.EmailId = userDetail.EmailId;
            existingUser.Password = userDetail.Password;
            existingUser.IsActive = userDetail.IsActive;

            _dbcontext.UserDetails.Update(existingUser);
            return _dbcontext.SaveChanges() > 0;
        }

        public UserDetail GetUser(int id)
        {
            return _dbcontext.UserDetails.FirstOrDefault(u => u.Id == id);
        }

        public List<UserDetail> GetUsersList()
        {
            return _dbcontext.UserDetails.ToList();
        }
    }
}
