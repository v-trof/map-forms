export const useRouter = () => {
    return {
        navigate: (page: string) => {
            alert('NAVIGATE TO ' + page);
        },
    };
};
