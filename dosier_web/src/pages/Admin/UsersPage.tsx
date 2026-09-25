import React from 'react';
import UserProfileModal from './components/UserProfileModal';
import { useUsersPage } from './hooks/useUsersPage';
import { UsersHeader } from './components/UsersPage/UsersHeader';
import { DraftBanners } from './components/UsersPage/DraftBanners';
import { UsersTable } from './components/UsersPage/UsersTable';
import { UserDetailPanel } from './components/UsersPage/UserDetailPanel';
import { ConfirmDialogModal } from './components/UsersPage/ConfirmDialogModal';

const UsersPage = () => {
    const {
        users,
        roles,
        search,
        setSearch,
        userType,
        setUserType,
        soloConHoras,
        setSoloConHoras,
        filtroDocente,
        setFiltroDocente,
        departamento,
        setDepartamento,
        availableDepartments,
        page,
        setPage,
        pageSize,
        totalCount,
        totalPages,
        loading,
        selectedUser,
        setSelectedUser,
        detailUser,
        setDetailUser,
        lastActiveUserId,
        setLastActiveUserId,
        pendingUserDraft,
        setPendingUserDraft,
        confirmDialog,
        setConfirmDialog,
        searchInputRef,
        isOverlayMouseDownRef,
        fetchUsers,
        handleCloseDetail,
        handleRestoreUserDraft,
        handleDiscardUserDraft
    } = useUsersPage();

    const openedAtRef = React.useRef<number>(0);

    return (
        <main className="flex-1 bg-bg-deep p-4 md:p-10 overflow-y-auto transition-colors duration-300">
            <style>{`
                .row-last-active {
                    background-color: rgba(0, 112, 243, 0.08) !important;
                    transition: background-color 0.2s ease-in-out;
                }
            `}</style>
            
            <div className="space-y-6">
                <UsersHeader
                    userType={userType}
                    setUserType={setUserType}
                    soloConHoras={soloConHoras}
                    setSoloConHoras={setSoloConHoras}
                    filtroDocente={filtroDocente}
                    setFiltroDocente={setFiltroDocente}
                    departamento={departamento}
                    setDepartamento={setDepartamento}
                    availableDepartments={availableDepartments}
                    search={search}
                    setSearch={setSearch}
                    loading={loading}
                    searchInputRef={searchInputRef}
                />

                <DraftBanners
                    pendingUserDraft={pendingUserDraft}
                    handleRestoreUserDraft={handleRestoreUserDraft}
                    handleDiscardUserDraft={handleDiscardUserDraft}
                />

                <UsersTable
                    users={users}
                    roles={roles}
                    search={search}
                    userType={userType}
                    page={page}
                    setPage={setPage}
                    pageSize={pageSize}
                    totalCount={totalCount}
                    totalPages={totalPages}
                    loading={loading}
                    detailUser={detailUser}
                    setDetailUser={setDetailUser}
                    lastActiveUserId={lastActiveUserId}
                    setLastActiveUserId={setLastActiveUserId}
                    setSelectedUser={setSelectedUser}
                    openedAtRef={openedAtRef}
                />
            </div>

            {selectedUser && (
                <UserProfileModal
                    user={selectedUser}
                    onClose={() => { setSelectedUser(null); fetchUsers(); }}
                    onDraftCleared={() => setPendingUserDraft(null)}
                />
            )}

            <UserDetailPanel
                detailUser={detailUser}
                handleCloseDetail={handleCloseDetail}
                isOverlayMouseDownRef={isOverlayMouseDownRef}
                setSelectedUser={setSelectedUser}
            />

            <ConfirmDialogModal
                confirmDialog={confirmDialog}
                setConfirmDialog={setConfirmDialog}
            />
        </main>
    );
};

export default UsersPage;
