using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EventManagment.DAL.Model;

namespace EventManagment.DAL.Repository
{
    public interface IRepository
    {
        public bool AddUser(UserDetail userDetail);
        public bool EditUser(UserDetail userDetail);
        public UserDetail GetUser(int id);
        public List<UserDetail> GetUsersList();

    }
}
