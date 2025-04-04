import React from 'react';
import Provider from './provider';
function WorkspaceLayout({
    children,
}:Readonly<{
    children:React.ReactNode;

}>){
    return (
        <Provider>{children}</Provider>
    )
}

export default WorkspaceLayout