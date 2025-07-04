import React from 'react';
import { RootState } from '@/store/store.ts';
import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.ts';
import { selectBreadcrumb } from '@/store/selectors/breadcrumb.ts';
import { changeFolder } from '@/store/slices/fileSystemThunks.ts';
import { ChevronRight, Home } from 'lucide-react';

const BreadcrumbNavigation: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFolderId = useAppSelector((state: RootState) => state.navigation.currentFolderId);
  const breadcrumbs = useAppSelector(selectBreadcrumb(currentFolderId));

  return (
    <nav className="flex items-center space-x-1 text-sm">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <React.Fragment key={item.id}>
            {/* Divider  */}
            {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground/50" />}

            {/* Nút / Link */}
            <NavLink
              to={item.id === 'root' ? '/' : `/folder/${item.id}`}
              onClick={() => !isLast && dispatch(changeFolder(item.id))}
              className={`
            flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all duration-200
            ${
              isLast
                ? 'text-primary bg-primary/10 shadow-sm cursor-default' /* item cuối */
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            }
          `}
            >
              {item.id === 'root' && <Home className="w-4 h-4" />}
              <span>{item.name}</span>
            </NavLink>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default BreadcrumbNavigation;
