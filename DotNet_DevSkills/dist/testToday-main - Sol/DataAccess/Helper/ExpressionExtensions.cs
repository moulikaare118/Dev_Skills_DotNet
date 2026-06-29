using DataAccess.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Helper
{
    public static class ExpressionExtensions
    {
        public static Expression<Func<T, bool>> And<T>(
        this Expression<Func<T, bool>> left,
        Expression<Func<T, bool>> right)
        {
            var parameter = Expression.Parameter(typeof(T));

            var leftVisitor = new ReplaceExpressionVisitor(left.Parameters[0], parameter);
            var leftExpr = leftVisitor.Visit(left.Body);

            var rightVisitor = new ReplaceExpressionVisitor(right.Parameters[0], parameter);
            var rightExpr = rightVisitor.Visit(right.Body);

            if (leftExpr == null || rightExpr == null)
            {
                throw new InvalidOperationException("Unable to combine the supplied expressions.");
            }

            return Expression.Lambda<Func<T, bool>>(
                Expression.AndAlso(leftExpr, rightExpr), parameter);
        }
        internal class ReplaceExpressionVisitor : ExpressionVisitor
        {
            private readonly Expression _oldValue;
            private readonly Expression _newValue;

            public ReplaceExpressionVisitor(Expression oldValue, Expression newValue)
            {
                _oldValue = oldValue;
                _newValue = newValue;
            }

            public override Expression? Visit(Expression? node)
                => node == _oldValue ? _newValue : base.Visit(node);
        }
    }
}
